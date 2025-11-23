import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === 'ADMIN' ? '/admin' : '/dashboard');
  }

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dcamqqj3j/image/upload/v1762322564/Login_tasknity.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Welcome to TN.proto</CardTitle>
            <CardDescription>
              Please enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
         <p className="px-8 text-center text-sm text-muted-foreground mt-4 bg-background/50 backdrop-blur-sm rounded-md p-2">
            An Appnity Softwares Pvt. Ltd. Product

          </p>
      </div>
    </main>
  );
}
