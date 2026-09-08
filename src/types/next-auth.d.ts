import { Role, UserStatus, UserType, VerificationStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    userType?: UserType;
    status: UserStatus;
    studentVerificationStatus?: VerificationStatus;
    driverVerificationStatus?: VerificationStatus;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      userType?: UserType;
      status: UserStatus;
      studentVerificationStatus?: VerificationStatus;
      driverVerificationStatus?: VerificationStatus;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    userType?: UserType;
    status: UserStatus;
    studentVerificationStatus?: VerificationStatus;
    driverVerificationStatus?: VerificationStatus;
  }
}
