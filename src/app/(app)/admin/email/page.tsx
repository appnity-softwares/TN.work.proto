// src/app/(app)/admin/email/page.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import SendEmailForm from '@/components/admin/SendEmailForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminEmailPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Send Email</h1>
      <p className="text-muted-foreground">Compose and send emails to employees, admins or everyone.</p>

      <div className="mt-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Client component */}
            {/* @ts-expect-error Server -> Client */}
            <SendEmailForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
