"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import * as bcrypt from "bcrypt";
import { createSession, deleteSession } from "@/lib/session";
import { getUserByEmployeeCode } from "@/lib/data";
import { verifyCredentials } from "@/ai/flows/credential-verification";

const loginSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required."),
  passcode: z.string().min(1, "Passcode is required."),
});

type LoginState = {
  success: boolean;
  message: string;
  role?: "ADMIN" | "EMPLOYEE";
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data.",
    };
  }

  const { employeeCode, passcode } = validatedFields.data;

  const user = await getUserByEmployeeCode(employeeCode);

  if (!user) {
    return { success: false, message: "Employee code not found." };
  }

  const isPasscodeValid = await bcrypt.compare(passcode, user.hashedPasscode);

  if (!isPasscodeValid) {
     const verificationResult = await verifyCredentials({
        employeeCode: employeeCode,
        passcode: passcode,
        databaseEmployeeCode: user.employeeCode,
        databaseHashedPasscode: user.hashedPasscode,
      });

      if (verificationResult.isValid) {
         await createSession({
          id: user.id,
          name: user.name,
          employeeCode: user.employeeCode,
          role: user.role,
        });
        return { success: true, message: "Login successful (AI corrected).", role: user.role };
      }

      return {
        success: false,
        message: verificationResult.reason || "Invalid credentials. Please try again.",
      };
  }


  await createSession({
    id: user.id,
    name: user.name,
    employeeCode: user.employeeCode,
    role: user.role,
  });
  
  return { success: true, message: "Login successful.", role: user.role };
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
