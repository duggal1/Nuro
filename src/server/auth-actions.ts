"use server";

import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

/**
 * Signs out the current user
 */
export async function signOut() {
  try {
    const cookieStore = cookies();
    await auth.api.signOut({
      headers: {
        cookie: cookieStore.toString()
      }
    });
    return { success: true };
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return { success: false, error };
  }
}

/**
 * Resets the user's password given a token
 */
export async function resetPassword(
  token: string, 
  password: string
) {
  try {
    const response = await auth.api.resetPassword({
      body: {
        newPassword: password,
        token
      }
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return { success: false, error };
  }
}

/**
 * Gets the current session
 */
export async function getSession(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session) {
      return { success: false, error: "No session found" };
    }
    
    return { success: true, data: session };
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return { success: false, error };
  }
} 