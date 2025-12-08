'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ErrorDashboard() {
  // Dummy data for now
  const errors = [
    { id: 1, message: 'Failed to fetch clients', count: 3 },
    { id: 2, message: 'Error updating user', count: 1 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {errors.map(error => (
            <li key={error.id} className="flex justify-between">
              <span>{error.message}</span>
              <span>{error.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
