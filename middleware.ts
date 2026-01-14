import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login"
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/trades/:path*", "/settings/:path*", "/api/hl/:path*"]
};
