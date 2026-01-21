import { signUp, signIn, signOut, getCurrentUser, resetPassword } from '@crafted/auth';
import { db } from '@crafted/database';
import { sendWelcomeEmail } from '@crafted/emails';
import { createTeam, getUserTeams } from './team.service';

export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
  teamName?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterUserInput) {
  let supabaseUserId: string | undefined;

  try {
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const data = await signUp(input);

    if (!data.user) {
      throw new Error('Failed to create user in authentication system');
    }

    supabaseUserId = data.user.id;

    const dbUser = await db.user.create({
      data: {
        email: input.email,
        name: input.name,
        supabaseId: data.user.id,
      },
    });

    // Auto-create default team for user (1 account = 1 team)
    const teamName = input.teamName || input.name || input.email.split('@')[0];
    const teamSlug = `team-${dbUser.id.toLowerCase()}`;

    try {
      await createTeam(dbUser.id, {
        name: teamName,
        slug: teamSlug,
        description: `${teamName}'s team`,
        color: '#3b82f6',
      });
    } catch (teamError) {
      console.error('Failed to create default team:', teamError);
      // Rollback user creation if team creation fails
      await db.user.delete({ where: { id: dbUser.id } });
      throw new Error('Failed to create user account and team');
    }

    try {
      await sendWelcomeEmail(input.email, input.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return {
      user: data.user,
      session: data.session,
      dbUser,
    };
  } catch (error) {
    if (supabaseUserId) {
      await rollbackSupabaseUser(supabaseUserId);
    }
    throw error;
  }
}

export async function loginUser(input: LoginUserInput) {
  const authData = await signIn(input);

  // Get user from database
  if (authData.user) {
    const dbUser = await db.user.findUnique({
      where: { supabaseId: authData.user.id },
    });

    if (dbUser) {
      // Check if user has a team, create one if not (for existing users)
      try {
        await getUserTeams(dbUser.id);
      } catch (teamError) {
        console.error('Failed to get/create user team on login:', teamError);
        // Don't break login if team creation fails
      }
    }
  }

  return authData;
}

export async function logoutUser() {
  return await signOut();
}

export async function getUser() {
  const supabaseUser = await getCurrentUser();
  if (!supabaseUser) return null;

  const dbUser = await db.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  return dbUser;
}

export async function requestPasswordReset(email: string) {
  return await resetPassword(email);
}

async function rollbackSupabaseUser(userId: string) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      await adminClient.auth.admin.deleteUser(userId);
    }
  } catch (rollbackError) {
    console.error('Failed to rollback Supabase user:', rollbackError);
  }
}
