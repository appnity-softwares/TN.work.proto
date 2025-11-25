import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import ClientCreateForm from "@/components/admin/client-create-form";
import { getBaseUrl } from "@/lib/getBaseUrl";

const BASE_URL = getBaseUrl();

/* ---------------- COOKIE HEADER ---------------- */
async function getFormData() {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const [usersRes, projectsRes] = await Promise.all([
    fetch(`${BASE_URL}/api/employees`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
    fetch(`${BASE_URL}/api/allprojects`, {
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

/* ---------------- PAGE ---------------- */
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
