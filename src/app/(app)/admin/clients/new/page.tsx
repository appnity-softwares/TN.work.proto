import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import ClientCreateForm from "@/components/admin/client-create-form";

async function getFormData() {
  const cookieStore = await cookies();

  // ✅ FIX: Proper cookie header
  const cookieHeader = Array.from(cookieStore.getAll())
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const [usersRes, projectsRes] = await Promise.all([
    fetch("http://localhost:3000/api/employees", {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
    fetch("http://localhost:3000/api/allprojects", {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
  ]);

  if (!usersRes.ok || !projectsRes.ok) {
    redirect("/admin");
  }

  const users = await usersRes.json();
  const projects = await projectsRes.json();

  return {
    users: users.users || [],
    projects: projects.projects || [],
  };
}

export default async function NewClientPage() {
  const { users, projects } = await getFormData();

  return (
    <div className="p-6">
      <PageHeader
        title="Create Client"
        description="Add new client and assign employees & projects"
      />
      <ClientCreateForm users={users} projects={projects} />
    </div>
  );
}
