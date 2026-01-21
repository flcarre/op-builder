export { supabase } from './client';
export type { SupabaseClient } from './client';

export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  resetPassword,
  updatePassword,
  signInWithGoogle,
  signInWithGithub,
  getUserFromToken,
} from './utils';

export type { SignUpData, SignInData } from './utils';
