import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { InactivityLogoutWrapper } from "@/components/InactivityLogoutWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = { variable: "font-sans" };

export const metadata = {
  title: "GearUp | Pakistan's Premier B2B Sports Marketplace",
  description:
    "Connect with verified manufacturers, streamline bulk ordering, and transform your sports goods business with GearUp.",
  keywords: "sports manufacturing, B2B marketplace, cricket, football, Pakistan, GearUp",
};

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '977790937405-ks3rj67mmet2pgmmi0v1occf7b9vpdsa.apps.googleusercontent.com';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleOAuthProvider clientId={clientId}>
          <ErrorBoundary>
            <AuthProvider>
              <InactivityLogoutWrapper>
                {children}
              </InactivityLogoutWrapper>
            </AuthProvider>
          </ErrorBoundary>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
