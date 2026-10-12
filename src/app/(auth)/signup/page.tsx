import type { Metadata } from 'next';
import { SignupPanel } from '@/components/auth/SignupPanel';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = null } = await searchParams;
  return <SignupPanel next={next} />;
}
