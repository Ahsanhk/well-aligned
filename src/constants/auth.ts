export const AUTH_ROUTES = {
  login: '/login',
  signup: '/signup',
  callback: '/auth/callback',
  home: '/',
} as const;

export const AUTH_PAGES: string[] = [AUTH_ROUTES.login, AUTH_ROUTES.signup];

export const PUBLIC_PATHS: string[] = [...AUTH_PAGES, '/auth'];

export const NEXT_PARAM = 'next';

export const PASSWORD_MIN_LENGTH = 8;

export const FULL_NAME_MAX_LENGTH = 120;

export const RESEND_COOLDOWN_SECONDS = 60;

export const AUTH_ERRORS = {
  generic: 'Something went wrong. Please try again.',
  invalidCredentials: 'Invalid email or password',
  emailTaken: 'An account with this email already exists',
  emailNotConfirmed: 'Confirm your email first. Check your inbox for the link.',
  rateLimited: 'Too many attempts. Wait a minute and try again.',
  weakPassword: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  callback: 'That link has expired or was opened in a different browser. If you just confirmed your email, sign in below.',
  network: 'Can’t reach the server. Check your connection and try again.',
  sessionExpired: 'Please sign in again.',
} as const;

export const VALIDATION_MESSAGES = {
  fullNameRequired: 'Enter your full name',
  fullNameTooLong: `Keep it under ${FULL_NAME_MAX_LENGTH} characters`,
  emailInvalid: 'Enter a valid email address',
  passwordRequired: 'Enter your password',
  passwordTooShort: `Use at least ${PASSWORD_MIN_LENGTH} characters`,
} as const;

export const AUTH_COPY = {
  loginTitle: 'Welcome back',
  loginSubtitle: 'Sign in to pick up where your last meeting left off.',
  loginSubmit: 'Sign in',
  signupTitle: 'Create your account',
  signupSubtitle: 'Track client asks, attach proof, and ship prompts to Claude Code.',
  signupSubmit: 'Create account',
  fullNameLabel: 'Full name',
  fullNamePlaceholder: 'Ada Lovelace',
  emailLabel: 'Email',
  emailPlaceholder: 'you@company.com',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  toSignupPrompt: 'Don’t have an account?',
  toSignupLink: 'Sign up',
  toLoginPrompt: 'Already have an account?',
  toLoginLink: 'Sign in',
  checkInboxTitle: 'Check your inbox',
  checkInboxBody: 'We sent a confirmation link to',
  checkInboxHint: 'Open it on this device to finish signing in. It can take a minute to arrive.',
  resend: 'Resend email',
  resendIn: (seconds: number) => `Resend in ${seconds}s`,
  resent: 'Sent. Check your inbox again.',
  useDifferentEmail: 'Use a different email',
  footer: 'Your projects and recordings are private to your account.',
  signOut: 'Sign out',
  accountMenu: 'Account menu',
} as const;

export const PASSWORD_STRENGTH_LEVELS = [
  { label: 'Too short', barClass: 'bg-danger', textClass: 'text-danger' },
  { label: 'Weak', barClass: 'bg-danger', textClass: 'text-danger' },
  { label: 'Fair', barClass: 'bg-warning', textClass: 'text-warning' },
  { label: 'Good', barClass: 'bg-indigo', textClass: 'text-indigo' },
  { label: 'Strong', barClass: 'bg-success', textClass: 'text-success' },
] as const;

export const PASSWORD_STRENGTH_SEGMENTS = 4;
