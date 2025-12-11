'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { UserWithMeta } from '@/lib/types';

type RecipientType = 'single' | 'multiple' | 'role' | 'all';

export default function SendEmailForm({
  preselectedUserId,
  compact = false,
}: {
  preselectedUserId?: string | null;
  compact?: boolean;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>(
    preselectedUserId ? 'single' : 'role'
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(preselectedUserId ? [preselectedUserId] : []);
  const [role, setRole] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<UserWithMeta[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setAvailableLoading(true);
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to load users');
        }
        const json = await res.json();
        setUsers(json.users || []);
      } catch (err) {
        console.error('Failed to fetch users for email form', err);
        toast.error('Failed to load user list');
      } finally {
        setAvailableLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    let payload: any = {
      subject: subject.trim(),
      message: message.trim(),
      recipientType,
    };

    if (recipientType === 'single' || recipientType === 'multiple') {
      if (selectedUsers.length === 0) {
        toast.error('Select at least one user');
        return;
      }
      payload.recipients = selectedUsers;
    } else if (recipientType === 'role') {
      payload.role = role;
    } 

    setSending(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(err?.message || 'Failed to send emails');
      }

      const result = await res.json();
      toast.success(result.message || 'Emails queued/sent');
      if (result.details && result.details.length) {
        const infoCount = result.details.filter((d: any) => d.success).length;
        toast(`Sent to ${infoCount} recipients`);
      }

      setSubject('');
      setMessage('');
      setSelectedUsers(preselectedUserId ? [preselectedUserId] : []);
      setRecipientType(preselectedUserId ? 'single' : 'role');
    } catch (err: any) {
      console.error('Send email error', err);
      toast.error(err.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className={compact ? 'w-full' : 'max-w-2xl mx-auto'}>
      <CardHeader>
        <CardTitle>Send Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <Label>To</Label>
            <RadioGroup
              value={recipientType}
              onValueChange={(value: RecipientType) => setRecipientType(value)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple">Multiple</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="role" id="role" />
                <Label htmlFor="role">Role</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
            </RadioGroup>
          </div>

          {(recipientType === 'single' || recipientType === 'multiple') && (
            <div>
              <Label>Select User(s)</Label>
              {availableLoading ? (
                <div className="text-sm text-muted-foreground mt-2">Loading users…</div>
              ) : (
                <div className="mt-2 border rounded-md p-4 h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (recipientType === 'single') {
                            setSelectedUsers(checked ? [user.id] : []);
                          } else {
                            setSelectedUsers((prev) =>
                              checked ? [...prev, user.id] : prev.filter((id) => id !== user.id)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={user.id} className="font-normal">
                        {user.name} {user.email ? `- ${user.email}` : '(no email)'}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {recipientType === 'role' && (
            <div>
              <Label>Select Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: 'EMPLOYEE' | 'ADMIN') => setRole(value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="EMPLOYEE" id="employee" />
                  <Label htmlFor="employee">Employees</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADMIN" id="admin" />
                  <Label htmlFor="admin">Admins</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {recipientType === 'all' && (
            <p className="text-sm text-muted-foreground">This will send an email to every user with a saved email address.</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Email'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
