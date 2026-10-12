export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface SignupValues extends LoginValues {
  fullName: string;
}

export type FieldErrors<Values> = Partial<Record<keyof Values, string>>;

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;
