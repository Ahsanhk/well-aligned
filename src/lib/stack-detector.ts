import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  FILE_SIGNALS,
  FRAMEWORK_PACKAGES,
  GIT_DIR_NAME,
  LIBRARY_PACKAGES,
  LOCKFILE_MANAGERS,
  MARKER_STACK_LABELS,
  PACKAGE_JSON_FILE,
  PYTHON_FRAMEWORKS,
  PYTHON_LABEL,
  PYTHON_MANIFESTS,
  STACK_SEPARATOR,
  TAILWIND_LABEL,
  TAILWIND_V4_CSS_FILES,
  TAILWIND_V4_IMPORT,
} from '@/constants/stack';
import type { FolderInspection } from '@/types';
import { pathExists } from './fs-checks';

type Dependencies = Record<string, string>;

interface PackageJson {
  name?: unknown;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
}

interface PackageEntry {
  packages: string[];
  label: string;
}

async function readText(filePath: string) {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function readPackageJson(folder: string): Promise<PackageJson | null> {
  const text = await readText(path.join(folder, PACKAGE_JSON_FILE));
  if (text === null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? (parsed as PackageJson) : null;
  } catch {
    return null;
  }
}

function allDependencies(pkg: PackageJson | null): Dependencies {
  if (!pkg) return {};
  return { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
}

export function majorVersion(spec: string | undefined) {
  const match = spec?.match(/(\d+)(?:\.\d+)*/);
  return match ? match[1] : null;
}

function matchPackages(entries: PackageEntry[], deps: Dependencies) {
  return entries.filter((entry) => entry.packages.some((name) => name in deps));
}

function frameworkLabels(deps: Dependencies) {
  return matchPackages(FRAMEWORK_PACKAGES, deps).map((entry, index) => {
    if (index > 0) return entry.label;
    const version = majorVersion(entry.packages.map((name) => deps[name]).find(Boolean));
    return version ? `${entry.label} ${version}` : entry.label;
  });
}

async function fileSignalLabels(folder: string) {
  const checks = await Promise.all(
    FILE_SIGNALS.map(async (signal) => {
      const found = await Promise.all(signal.paths.map((relative) => pathExists(path.join(folder, relative))));
      return found.some(Boolean) ? signal.label : null;
    }),
  );
  return checks.filter((label): label is string => label !== null);
}

async function tailwindV4Label(folder: string) {
  const contents = await Promise.all(TAILWIND_V4_CSS_FILES.map((relative) => readText(path.join(folder, relative))));
  return contents.some((text) => text !== null && TAILWIND_V4_IMPORT.test(text)) ? [TAILWIND_LABEL] : [];
}

async function pythonLabels(folder: string) {
  const contents = await Promise.all(PYTHON_MANIFESTS.map((file) => readText(path.join(folder, file))));
  const present = contents.filter((text): text is string => text !== null);
  if (present.length === 0) return [];
  const combined = present.join('\n');
  const frameworks = PYTHON_FRAMEWORKS.filter((entry) => entry.pattern.test(combined)).map((entry) => entry.label);
  return [...frameworks, PYTHON_LABEL];
}

async function markerLabels(folder: string) {
  const checks = await Promise.all(
    MARKER_STACK_LABELS.map(async (entry) => ((await pathExists(path.join(folder, entry.file))) ? entry.label : null)),
  );
  return checks.filter((label): label is string => label !== null);
}

async function packageManagerLabel(folder: string) {
  for (const manager of LOCKFILE_MANAGERS) {
    if (await pathExists(path.join(folder, manager.file))) return [manager.label];
  }
  return [];
}

function dedupeByBaseLabel(labels: string[]) {
  const seen = new Set<string>();
  return labels.filter((label) => {
    const base = label.replace(/\s\d+$/, '');
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
}

export function prettifyName(raw: string) {
  return raw
    .replace(/^@[^/]+\//, '')
    .replace(/[-_.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function inspectFolder(folder: string): Promise<FolderInspection> {
  const pkg = await readPackageJson(folder);
  const deps = allDependencies(pkg);
  const [python, markers, fileSignals, tailwindV4, packageManager, isGitRepo] = await Promise.all([
    pythonLabels(folder),
    markerLabels(folder),
    fileSignalLabels(folder),
    tailwindV4Label(folder),
    packageManagerLabel(folder),
    pathExists(path.join(folder, GIT_DIR_NAME)),
  ]);
  const libraries = matchPackages(LIBRARY_PACKAGES, deps).map((entry) => entry.label);
  const stack = dedupeByBaseLabel([
    ...frameworkLabels(deps),
    ...python,
    ...markers,
    ...libraries,
    ...tailwindV4,
    ...fileSignals,
    ...packageManager,
  ]);
  const rawName = typeof pkg?.name === 'string' && pkg.name.trim() ? pkg.name : path.basename(folder);
  return { name: prettifyName(rawName), techStack: stack.join(STACK_SEPARATOR), isGitRepo, stack, path: folder };
}
