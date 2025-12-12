"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmployeeProfile({ params }: any) {
  const { id } = params;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/employee/${id}`);
      const data = await res.json();
      setUser(data.employee);
      setForm(data.employee);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;

  if (!user) return <div className="p-10">User not found</div>;

  // Chart data from attendance
  const attendanceChart = user.attendance?.map((a: any) => ({
    date: new Date(a.date).toLocaleDateString(),
    hours: a.hours || 0,
  }));

  // Handle form changes
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save changes
  const handleSave = async () => {
    const res = await fetch(`/api/admin/employee/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.employee);
      setEditMode(false);
    } else {
      alert("Failed to update employee");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* PROFILE HEADER */}
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.image || user?.avatar} />
            <AvatarFallback>{user.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            {editMode ? (
              <div className="space-y-2">
                <div>
                  <Label>Name</Label>
                  <Input name="name" value={form.name || ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Employee Code</Label>
                  <Input name="employeeCode" value={form.employeeCode || ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input name="status" value={form.status || ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Join Date</Label>
                  <Input name="joinDate" value={form.joinDate ? new Date(form.joinDate).toISOString().slice(0,10) : ""} type="date" onChange={handleChange} />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">Employee Code: {user.employeeCode}</p>
                <p className="text-muted-foreground">Status: {user.status}</p>
                <p className="text-muted-foreground">Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                <Button className="mt-2" onClick={() => setEditMode(true)}>Edit</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ATTENDANCE CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Hours — Last 50 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart}>
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ATTENDANCE LOG */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {user.attendance?.map((a: any) => (
            <div key={a.id} className="border p-3 rounded-lg">
              <p>Date: {new Date(a.date).toLocaleDateString()}</p>
              <p>Clock In: {a.clockIn}</p>
              <p>Clock Out: {a.clockOut}</p>
              <p>Hours: {a.hours}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* WORK LOGS */}
      <Card>
        <CardHeader>
          <CardTitle>Work Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {user.workLogs?.map((w: any) => (
            <div key={w.id} className="border p-3 rounded-lg">
              <p>Date: {new Date(w.createdAt).toLocaleString()}</p>
              <p>{w.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
