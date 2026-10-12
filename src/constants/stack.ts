export const FRAMEWORK_PACKAGES: { packages: string[]; label: string }[] = [
  { packages: ['next'], label: 'Next.js' },
  { packages: ['nuxt'], label: 'Nuxt' },
  { packages: ['@sveltejs/kit'], label: 'SvelteKit' },
  { packages: ['expo'], label: 'Expo' },
  { packages: ['react-native'], label: 'React Native' },
  { packages: ['nestjs', '@nestjs/core'], label: 'NestJS' },
  { packages: ['express'], label: 'Express' },
  { packages: ['vue'], label: 'Vue' },
  { packages: ['svelte'], label: 'Svelte' },
  { packages: ['react'], label: 'React' },
];

export const LIBRARY_PACKAGES: { packages: string[]; label: string }[] = [
  { packages: ['tailwindcss', '@tailwindcss/postcss', '@tailwindcss/vite'], label: 'Tailwind' },
  { packages: ['@supabase/supabase-js', '@supabase/ssr'], label: 'Supabase' },
  { packages: ['prisma', '@prisma/client'], label: 'Prisma' },
  { packages: ['drizzle-orm'], label: 'Drizzle' },
  { packages: ['typescript'], label: 'TypeScript' },
];

export const FILE_SIGNALS: { paths: string[]; label: string }[] = [
  { paths: ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs', 'tailwind.config.cjs'], label: 'Tailwind' },
  { paths: ['supabase'], label: 'Supabase' },
  { paths: ['prisma/schema.prisma'], label: 'Prisma' },
  { paths: ['tsconfig.json'], label: 'TypeScript' },
  { paths: ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'], label: 'Docker' },
  { paths: ['.github/workflows'], label: 'GitHub Actions' },
];

export const TAILWIND_V4_CSS_FILES = [
  'src/app/globals.css',
  'app/globals.css',
  'src/styles/globals.css',
  'styles/globals.css',
  'src/index.css',
  'src/app.css',
];

export const TAILWIND_V4_IMPORT = /@import\s+["']tailwindcss["']/;

export const TAILWIND_LABEL = 'Tailwind';

export const LOCKFILE_MANAGERS: { file: string; label: string }[] = [
  { file: 'pnpm-lock.yaml', label: 'pnpm' },
  { file: 'yarn.lock', label: 'yarn' },
  { file: 'bun.lockb', label: 'bun' },
  { file: 'bun.lock', label: 'bun' },
  { file: 'package-lock.json', label: 'npm' },
];

export const PYTHON_MANIFESTS = ['requirements.txt', 'pyproject.toml'];

export const PYTHON_FRAMEWORKS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bdjango\b/i, label: 'Django' },
  { pattern: /\bfastapi\b/i, label: 'FastAPI' },
  { pattern: /\bflask\b/i, label: 'Flask' },
];

export const PYTHON_LABEL = 'Python';

export const MARKER_STACK_LABELS: { file: string; label: string }[] = [
  { file: 'go.mod', label: 'Go' },
  { file: 'Cargo.toml', label: 'Rust' },
  { file: 'Gemfile', label: 'Rails' },
];

export const PACKAGE_JSON_FILE = 'package.json';

export const GIT_DIR_NAME = '.git';

export const STACK_SEPARATOR = ', ';

export const STACK_DISPLAY_SEPARATOR = ' · ';

export const FOLDER_DETECT_DEBOUNCE_MS = 600;
