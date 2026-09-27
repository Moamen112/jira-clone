/**
 * Authentication and 2FA data types.
 */

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TotpSetupRequiredResponse {
  status: 'totp_setup_required';
  secret: string;
  otpauth_uri: string;
  pending_token: string;
}

export interface OtpRequiredResponse {
  status: 'otp_required';
  pending_token: string;
}

export type LoginResponse = TotpSetupRequiredResponse | OtpRequiredResponse;

export interface VerifyTotpPayload {
  pending_token: string;
  code: string;
}

export interface VerifyTotpResponse {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  job_title?: string;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Pending2FAState {
  pendingToken: string;
  status: 'totp_setup_required' | 'otp_required';
  secret?: string;
  otpauthUri?: string;
}
