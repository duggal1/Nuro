import { db } from "../../db/drizzle";
import { schema } from "../../db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET as string,
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            // In a real application, you would send an email here
            console.log(`Password reset link for ${user.email}: ${url}`);
        }
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            // In a real application, you would send an email here
            console.log(`Verification link for ${user.email}: ${url}`);
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
    }),
    plugins: [nextCookies()]
});