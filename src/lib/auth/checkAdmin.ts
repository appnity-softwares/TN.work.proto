export function checkAdmin(user: any) {
    if (!user || user.role !== "ADMIN") {
      throw new Error("You are not authorized.");
    }
  }
  