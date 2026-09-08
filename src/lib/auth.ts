import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@college.edu" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || user.status === "SUSPENDED") {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.userType,
          status: user.status,
          studentVerificationStatus: user.studentVerificationStatus,
          driverVerificationStatus: user.driverVerificationStatus,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
        token.status = user.status;
        token.studentVerificationStatus = user.studentVerificationStatus;
        token.driverVerificationStatus = user.driverVerificationStatus;
      }
      
      // Always pull fresh user role/status/userType from DB on session update if token present
      if (trigger === "update" || !token.role) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
        if (dbUser) {
          token.role = dbUser.role;
          token.userType = dbUser.userType;
          token.status = dbUser.status;
          token.studentVerificationStatus = dbUser.studentVerificationStatus;
          token.driverVerificationStatus = dbUser.driverVerificationStatus;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || token.id;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.role = token.role;
        session.user.userType = token.userType;
        session.user.status = token.status;
        session.user.studentVerificationStatus = token.studentVerificationStatus;
        session.user.driverVerificationStatus = token.driverVerificationStatus;
      }
      return session;
    }
  }
};
