import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      bandApproved?: boolean;
      profileApproved?: boolean;
      /** Rol efectivo para permisos: USUARIO si el perfil no está aprobado */
      effectiveRole?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    profileApproved?: boolean;
    effectiveRole?: string;
  }
}
