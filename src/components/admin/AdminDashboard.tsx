import Link from 'next/link';

export function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/portal/admin/employees" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-semibold">Manage Employees</h2>
        </Link>
        <Link href="/portal/admin/clients" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-semibold">Manage Clients</h2>
        </Link>
        <Link href="/portal/admin/work" className="p-4 border rounded-lg hover:bg-gray-100">
          <h2 className="text-xl font-semibold">Work Logs</h2>
        </Link>
      </div>
    </div>
  );
}
