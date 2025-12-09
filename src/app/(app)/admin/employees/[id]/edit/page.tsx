import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditEmployeeForm } from './edit-form';

interface EmployeeEditPageProps {
    params: { id: string };
}

export default async function EmployeeEditPage({ params }: EmployeeEditPageProps) {
    const employee = await db.user.findUnique({
        where: { id: params.id },
    });

    if (!employee) {
        notFound();
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Employee</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditEmployeeForm employee={employee} />
                </CardContent>
            </Card>
        </div>
    );
}