import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

const authSecret = process.env.NEXTAUTH_SECRET;

if (!authSecret) {
  throw new Error("NEXTAUTH_SECRET missing");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { default: clientPromise } = await import("@/lib/mongodb");
        const bcrypt = await import("bcryptjs");

        const client = await clientPromise;
        const db = client.db("revela_ai");
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email as string });

        if (!user || !user.password) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!valid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email as string,
          name: (user.name as string) ?? null,
          image: (user.image as string) ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "credentials") return true;

      if (!process.env.MONGODB_URI) return true;

      try {
        const { default: clientPromise } = await import("@/lib/mongodb");
        const client = await clientPromise;
        const db = client.db("revela_ai");

        await db.collection("users").updateOne(
          { email: user.email },
          {
            $set: {
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account?.provider,
              lastLogin: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error(err);
      }

      return true;
    },
  },
});