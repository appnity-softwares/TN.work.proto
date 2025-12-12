"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SendEmailForm from '@/components/admin/SendEmailForm';
import { toast } from 'sonner';
import { format } from "date-fns";
import {
  Download,
  FileText,
  Mail,
  PieChart,
  Calendar as CalendarIcon,
} from "lucide-react";

type AttendanceItem = { id: string; checkIn?: string | null; checkOut?: string | null };
type WorkLogItem = { id: string; date?: string | null; description?: string };
type NoticeItem = { id: string; title: string; message?: string; createdAt?: string | null };
type ReminderItem = { id: string; title: string; date?: string | null; time?: string | null };

interface EmployeeProps {
  employee: {
    id: string;
    name: string;
    email?: string | null;
    employeeCode?: string;
    role?: string;
    status?: string;
    avatar?: string | null;
    joinDate?: string | null;
  };
  mobileNumber?: string | null;
  documents?: any;
  leave?: { allowance?: number; taken?: number } | null;
  stats: {
    totalAttendanceRecords: number;
    totalWorkLogs: number;
    lastClockIn?: string | null;
  };
  lists: {
    attendance: AttendanceItem[];
    workLogs: WorkLogItem[];
    noticesIssued: NoticeItem[];
    reminders: ReminderItem[];
  };
}

export default function EmployeeDetailsClient(props: EmployeeProps) {
  const { employee, mobileNumber, documents, leave, stats, lists = { attendance: [], workLogs: [], noticesIssued: [], reminders: [] } } = props;

  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "documents" | "leave" | "graphs">("overview");
  const [openMessage, setOpenMessage] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const totalLeaves = leave?.allowance ?? 0;
  const takenLeaves = leave?.taken ?? 0;
  const remainingLeaves = Math.max(totalLeaves - takenLeaves, 0);

  const lastClockInDisplay = stats?.lastClockIn
    ? format(new Date(stats.lastClockIn), "PP p")
    : "—";

  const recentNotices = lists.noticesIssued ?? [];

  const attendanceSummary = useMemo(() => {
    const total = stats.totalAttendanceRecords || 0;
    const present = (lists.attendance || []).filter(a => a.checkIn).length;
    return { total, present };
  }, [stats.totalAttendanceRecords, lists.attendance]);

  const AttendanceMiniChart = ({ data }: { data: AttendanceItem[] }) => {
    const last = data.slice(0, 7);
    const values = last.map((d) => {
      const inT = d.checkIn ? new Date(d.checkIn).getTime() : 0;
      const outT = d.checkOut ? new Date(d.checkOut).getTime() : inT;
      const hrs = Math.max(0, (outT - inT) / (1000 * 60 * 60));
      return Number(hrs.toFixed(2));
    });
    const max = Math.max(...values, 1);
    return (
      <svg width="100%" height="48" viewBox="0 0 140 48" preserveAspectRatio="none" className="block">
        {values.map((v, i) => {
          const w = 14;
          const gap = 6;
          const x = i * (w + gap);
          const h = (v / max) * 40;
          const y = 46 - h;
          return <rect key={i} x={x} y={y} width={w} height={h} rx={2} fill="#4f46e5" />;
        })}
      </svg>
    );
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch (e) {}
    }
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Select a file to upload');
      return;
    }

    const fd = new FormData();
    fd.append('file', selectedFile);

    try {
      const res = await fetch(`/api/admin/employees/${employee.id}/documents/upload`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || 'Upload failed');
      }

      toast.success('File uploaded');
      setOpenUpload(false);
      setSelectedFile(null);
      if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (e) {} }
      setPreviewUrl(null);
    } catch (err: any) {
      console.error('Upload error', err);
      toast.error(err?.message || 'Upload failed');
    }
  };

  const enhancements = [
    "Performance / 1:1 notes",
    "Skill matrix & certifications",
    "Manager comments & goals",
    "Payroll snapshot",
    "Training progress",
    "Document verification workflow",
    "Attendance heatmap (monthly)",
    "Export PDF / CSV",
  ];

  return (
    <div className="space-y-6">
      {/* TOP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Profile */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {employee.avatar ? <AvatarImage src={employee.avatar} /> : <AvatarFallback className="text-xl">{(employee.name || "U")[0]}</AvatarFallback>}
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{employee.name}</h3>
                    <Badge>{employee.role}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {employee.employeeCode} • {employee.status}
                  </div>
                  <div className="mt-2 text-sm">
                    <div><strong>Email:</strong> {employee.email ?? <span className="text-muted-foreground">—</span>}</div>
                    <div><strong>Mobile:</strong> {mobileNumber ?? <span className="text-muted-foreground">—</span>}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(employee.email ?? "")}>
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>

                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Joined: {employee.joinDate ? format(new Date(employee.joinDate), "PPP") : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle: Hours & quick stats */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Work Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/40 text-center">
                  <div className="text-xs text-muted-foreground">Attendance Records</div>
                  <div className="text-xl font-bold">{stats.totalAttendanceRecords}</div>
                </div>
                <div className="p-3 rounded-md bg-muted/40 text-center">
                  <div className="text-xs text-muted-foreground">Work Logs</div>
                  <div className="text-xl font-bold">{stats.totalWorkLogs}</div>
                </div>
                <div className="p-3 rounded-md bg-muted/40 text-center col-span-2">
                  <div className="text-xs text-muted-foreground">Last Clock In</div>
                  <div className="text-lg font-medium">{lastClockInDisplay}</div>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-sm text-muted-foreground mb-2">Recent hours (last 7 entries)</div>
                <AttendanceMiniChart data={lists.attendance} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Notices / quick actions */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Notices & Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Recent Notices</div>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab("activity")}>
                  View all
                </Button>
              </div>

              <div className="space-y-2">
                {recentNotices.length === 0 && <div className="text-sm text-muted-foreground">No notices issued.</div>}
                {recentNotices.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2 rounded-md border">
                    <div className="font-semibold text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.createdAt ? format(new Date(n.createdAt), "PPP p") : ""}</div>
                    <div className="text-sm mt-1">{n.message}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => setOpenMessage(true)}>
                  <Mail className="mr-2 h-4 w-4" /> Message
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('documents')}>
                  <FileText className="mr-2 h-4 w-4" /> Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3">
        <button className={`px-3 py-2 rounded ${activeTab === "overview" ? "bg-primary text-white" : "bg-muted/30"}`} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={`px-3 py-2 rounded ${activeTab === "activity" ? "bg-primary text-white" : "bg-muted/30"}`} onClick={() => setActiveTab("activity")}>Activity</button>
        <button className={`px-3 py-2 rounded ${activeTab === "documents" ? "bg-primary text-white" : "bg-muted/30"}`} onClick={() => setActiveTab("documents")}>Documents</button>
        <button className={`px-3 py-2 rounded ${activeTab === "leave" ? "bg-primary text-white" : "bg-muted/30"}`} onClick={() => setActiveTab("leave")}>Leave</button>
        <button className={`px-3 py-2 rounded ${activeTab === "graphs" ? "bg-primary text-white" : "bg-muted/30"}`} onClick={() => setActiveTab("graphs")}>Graphs</button>
      </div>

      {/* TAB PANELS */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Total Records: {attendanceSummary.total}</div>
                <div className="mt-3">
                  <AttendanceMiniChart data={lists.attendance} />
                </div>
                <div className="mt-3 text-sm">Last 5 entries:</div>
                <div className="space-y-2 mt-2">
                  {lists.attendance.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex justify-between text-sm">
                      <div>{a.checkIn ? format(new Date(a.checkIn), "PPP p") : "—"}</div>
                      <div>{a.checkOut ? format(new Date(a.checkOut), "PPP p") : "—"}</div>
                    </div>
                  ))}
                  {lists.attendance.length === 0 && <div className="text-sm text-muted-foreground">No attendance records.</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lists.workLogs.length === 0 && <div className="text-sm text-muted-foreground">No work logs.</div>}
                  {lists.workLogs.slice(0, 5).map((w) => (
                    <div key={w.id} className="p-2 border rounded">
                      <div className="text-sm font-semibold">{w.description?.slice(0, 80) || "No description"}</div>
                      <div className="text-xs text-muted-foreground">{w.date ? format(new Date(w.date), "PPP") : ""}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meetings / Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                {lists.reminders.length === 0 && <div className="text-sm text-muted-foreground">No upcoming meetings.</div>}
                {lists.reminders.map((r) => (
                  <div key={r.id} className="p-2 border rounded mb-2">
                    <div className="font-semibold text-sm">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.date ? format(new Date(r.date), "PPP") : ""} {r.time ? `• ${r.time}` : ""}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Full Attendance</CardTitle></CardHeader>
              <CardContent>
                {lists.attendance.length === 0 && <div className="text-sm text-muted-foreground">No attendance records.</div>}
                {lists.attendance.map((a) => (
                  <div key={a.id} className="p-2 border-b flex justify-between items-center">
                    <div>
                      <div className="text-sm">{a.checkIn ? format(new Date(a.checkIn), "PPP p") : "—"}</div>
                      <div className="text-xs text-muted-foreground">{a.checkOut ? format(new Date(a.checkOut), "PPP p") : "—"}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{/* duration */}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notices Issued</CardTitle></CardHeader>
              <CardContent>
                {lists.noticesIssued.length === 0 && <div className="text-sm text-muted-foreground">No notices issued.</div>}
                {lists.noticesIssued.map((n) => (
                  <div key={n.id} className="p-2 border rounded mb-2">
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.createdAt ? format(new Date(n.createdAt), "PPP") : ""}</div>
                    <div className="text-sm mt-1">{n.message}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
              <CardContent>
                {(!documents || Object.keys(documents).length === 0) && <div className="text-sm text-muted-foreground">No documents uploaded.</div>}
                {documents?.idProof && (
                  <div className="flex items-center justify-between p-2 border rounded mb-2">
                    <div>
                      <div className="font-semibold">ID Proof</div>
                      <div className="text-xs text-muted-foreground">Uploaded</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(documents.idProof, "_blank")}>
                        <FileText className="mr-2 h-4 w-4" /> View
                      </Button>
                    </div>
                  </div>
                )}

                {documents?.offerLetter && (
                  <div className="flex items-center justify-between p-2 border rounded mb-2">
                    <div>
                      <div className="font-semibold">Offer Letter</div>
                    </div>
                    <div>
                      <Button size="sm" onClick={() => window.open(documents.offerLetter, "_blank")}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>
                )}

                {documents?.certificates?.length > 0 && documents.certificates.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded mb-2">
                    <div>
                      <div className="font-semibold">{c.name || `Certificate ${i + 1}`}</div>
                      <div className="text-xs text-muted-foreground">{c.issuedAt ? format(new Date(c.issuedAt), "PPP") : ""}</div>
                    </div>
                    <div>
                      <Button size="sm" onClick={() => window.open(c.url, "_blank")}>View</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Document Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">Upload / Replace / Verify documents from here (requires implementation).</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => setOpenUpload(true)}>Upload</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        const res = await fetch(`/api/admin/employees/${employee.id}/documents/verify`, { method: 'POST' });
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({ message: 'Verify failed' }));
                          throw new Error(err.message || 'Verify failed');
                        }
                        toast.success('Document marked verified');
                      } catch (err: any) {
                        console.error('Verify error', err);
                        toast.error(err?.message || 'Verify failed');
                      }
                    }}>Mark Verified</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Leave Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm">Allowance: {totalLeaves}</div>
                <div className="text-sm">Taken: {takenLeaves}</div>
                <div className="text-sm">Remaining: {remainingLeaves}</div>
                <div className="mt-3">
                  <div className="text-sm text-muted-foreground">Leave history (not implemented)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Leave Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={() => alert("Open leave request UI")}>Request Leave</Button>
                  <Button variant="outline" onClick={() => alert("Open leave approvals")}>Approve</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "graphs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle><PieChart className="inline mr-2" /> Attendance / Work breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center">
                  {/* Simple placeholder chart */}
                  <svg viewBox="0 0 32 32" className="w-40 h-40">
                    <circle r="10" cx="16" cy="16" fill="#e6e7ff" />
                    <path d="M16 16 L16 6 A10 10 0 0 1 26 16 Z" fill="#4f46e5" />
                    <path d="M16 16 L26 16 A10 10 0 0 1 16 26 Z" fill="#60a5fa" />
                  </svg>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">Placeholder charts. Replace with real charts (recharts / chart.js) as enhancement.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle><CalendarIcon className="inline mr-2" /> Attendance Heatmap</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Heatmap placeholder (monthly)</div>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="h-6 w-6 bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Message dialog (re-uses admin SendEmailForm) */}
      <Dialog open={openMessage} onOpenChange={setOpenMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {employee.name}</DialogTitle>
          </DialogHeader>
          <div>
            <SendEmailForm preselectedUserId={employee.id} compact />
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenMessage(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents upload dialog */}
      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document for {employee.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
            {previewUrl && (
              <div>
                <div className="text-sm text-muted-foreground">Preview</div>
                <img src={previewUrl} alt="preview" className="max-h-40 mt-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button onClick={() => setOpenUpload(false)} variant="outline">Cancel</Button>
              <Button onClick={handleUpload}>Upload</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optional enhancements */}
      <Card>
        <CardHeader><CardTitle>Optional Enhancements</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {enhancements.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
