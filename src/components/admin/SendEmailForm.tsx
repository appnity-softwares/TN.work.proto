'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { UserWithMeta } from '@/lib/types';

type RecipientType = 'single' | 'multiple' | 'role' | 'all';

export default function SendEmailForm({
  preselectedUserId,
  compact = false,
}: {
  preselectedUserId?: string | null; // if present, defaults to single -> that user
  compact?: boolean; // smaller UI for modal/profile usage
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
    // fetch all users for selection (admins only see this component in admin UI)
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

    if (recipientType === 'single') {
      if (selectedUsers.length === 0) {
        toast.error('Select a user');
        return;
      }
      payload.recipients = [selectedUsers[0]];
    } else if (recipientType === 'multiple') {
      if (selectedUsers.length === 0) {
        toast.error('Select at least one user');
        return;
      }
      payload.recipients = selectedUsers;
    } else if (recipientType === 'role') {
      payload.role = role;
    } else if (recipientType === 'all') {
      // nothing extra
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
      // optionally show details
      if (result.details && result.details.length) {
        const infoCount = result.details.filter((d: any) => d.success).length;
        toast(`Sent to ${infoCount} recipients`);
      }

      // reset
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
    <form onSubmit={(e) => handleSend(e)} className={`space-y-4 ${compact ? 'max-w-lg' : ''}`}>
      <div>
        <label className="block text-sm font-medium mb-1">To</label>
        <div className="flex gap-2 items-center mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="recipientType"
              checked={recipientType === 'single'}
              onChange={() => setRecipientType('single')}
            />
            <span>Single</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="recipientType"
              checked={recipientType === 'multiple'}
              onChange={() => setRecipientType('multiple')}
            />
            <span>Multiple</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="recipientType"
              checked={recipientType === 'role'}
              onChange={() => setRecipientType('role')}
            />
            <span>Role</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="recipientType"
              checked={recipientType === 'all'}
              onChange={() => setRecipientType('all')}
            />
            <span>All</span>
          </label>
        </div>

        {(recipientType === 'single' || recipientType === 'multiple') && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Select user(s)</label>
            {availableLoading ? (
              <div className="text-sm text-muted-foreground">Loading users…</div>
            ) : (
              <select
                multiple={recipientType === 'multiple'}
                value={selectedUsers}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setSelectedUsers(opts);
                }}
                className="w-full border rounded px-2 py-1"
                size={Math.min(8, users.length || 6)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.email ? `— ${u.email}` : '— (no email)'}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {recipientType === 'role' && (
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2">
              <input type="radio" name="role" checked={role === 'EMPLOYEE'} onChange={() => setRole('EMPLOYEE')} />
              <span>Employees</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="role" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} />
              <span>Admins</span>
            </label>
          </div>
        )}

        {recipientType === 'all' && (
          <div className="text-sm text-muted-foreground">This will send to every user with a saved email.</div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message" />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send Email'}
        </Button>
      </div>
    </form>
  );
}
