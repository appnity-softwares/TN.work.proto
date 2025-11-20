"use server";

import { z } from "zod";
import * as bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { Role } from "@/lib/types";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  employeeCode: z.string().min(1, "Employee code is required."),
  passcode: z.string().min(4, "Passcode must be at least 4 characters."),
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
});

type CreateUserState = {
  success: boolean;
  message: string;
};

export async function createUser(
  prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const validatedFields = CreateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message:
        validatedFields.error.errors[0]?.message || "Invalid form data.",
    };
  }

  const { name, employeeCode, passcode, role } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { employeeCode },
    });

    if (existingUser) {
      return { success: false, message: "Employee code already exists." };
    }

    const hashedPasscode = await bcrypt.hash(passcode, 10);

    await prisma.user.create({
      data: {
        name,
        employeeCode,
        hashedPasscode,
        role,
      },
    });

    revalidatePath("/admin/employees");
    return { success: true, message: `Employee ${name} created.` };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Failed to create employee." };
  }
}

type DeleteUserState = {
    success: boolean;
    message: string;
}

export async function deleteUser(userId: string): Promise<DeleteUserState> {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/employees");
        return { success: true, message: "Employee deleted." };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Failed to delete employee." };
    }
}
