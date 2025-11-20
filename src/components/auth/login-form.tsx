"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { login } from "@/app/api/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : "Login"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push(state.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [state, router, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employeeCode" className="font-semibold">Employee Code</Label>
        <Input
          id="employeeCode"
          name="employeeCode"
          placeholder="e.g., EMP001"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passcode" className="font-semibold">Passcode</Label>
        <Input
          id="passcode"
          name="passcode"
          type="password"
          required
        />
      </div>
      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Login Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <SubmitButton />
    </form>
  );
}
