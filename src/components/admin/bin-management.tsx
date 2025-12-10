'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Bin } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import {
  PlusCircle,
  Trash,
  Loader2,
  StickyNote,
  ListTodo,
  Lightbulb,
  CalendarIcon,
  Users,
  Clock3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BinManagementProps {
  initialBinItems: Bin[];
}

interface Reminder {
  id: string;
  clientName: string;
  title: string;
  description?: string | null;
  date: string;     // ISO string from API
  time?: string | null;
  createdAt: string; // ISO
}

interface ClientSummary {
  id: string;
  name: string;
  companyName?: string | null;
}

export function BinManagement({ initialBinItems }: BinManagementProps) {
  const [binItems, setBinItems] = useState(initialBinItems);
  const [upcomingItems, setUpcomingItems] = useState<Bin[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  // 🔔 Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [reminderClientName, setReminderClientName] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>(new Date());
  const [reminderTime, setReminderTime] = useState('');
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  // -----------------------
  // BIN FETCH HELPERS
  // -----------------------
  const fetchBinItems = async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/bin?date=${formattedDate}`);
      if (!response.ok) throw new Error('Failed to fetch items.');
      const { binItems: fetchedItems } = await response.json();
      setBinItems(fetchedItems);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch bin items for the selected date.',
      });
    }
  };

  const fetchUpcomingItems = async () => {
    try {
      const response = await fetch('/api/bin/upcoming');
      if (!response.ok) throw new Error('Failed to fetch upcoming items.');
      const { upcomingItems: fetchedItems } = await response.json();
      setUpcomingItems(fetchedItems);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch upcoming items.',
      });
    }
  };

  // -----------------------
  // REMINDERS FETCH HELPERS
  // -----------------------
  const fetchRemindersForDate = async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/reminders?date=${formattedDate}`);
      if (!res.ok) throw new Error('Failed to fetch reminders');
      const { reminders: fetched } = await res.json();
      setReminders(fetched);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch reminders for this date.',
      });
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setClients(
        (data.clients || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          companyName: c.companyName,
        })),
      );
    } catch (error) {
      console.error('Client list fetch error:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchBinItems(selectedDate);
      fetchRemindersForDate(selectedDate);
    }
    fetchUpcomingItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // -----------------------
  // HANDLERS
  // -----------------------
  const handleCreateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;
    const type = formData.get('type') as string;

    const payload = { content, type, date };

    try {
      const response = await fetch('/api/bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create item.');

      toast({ title: 'Item Saved', description: 'Your new item has been saved to the bin.' });
      (e.target as HTMLFormElement).reset();
      setDate(new Date());
      // Refetch items
      fetchBinItems(selectedDate || new Date());
      fetchUpcomingItems();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not save item.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bin?id=${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Could not delete item');
      }

      toast({
        variant: 'destructive',
        title: 'Item Deleted',
        description: 'The item has been successfully deleted.',
      });

      // Refetch items
      fetchBinItems(selectedDate || new Date());
      fetchUpcomingItems();
    } catch (error) {
      console.error('❌ Delete Bin Item Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while deleting the item.',
      });
    }
  };

  const handleCreateReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reminderDate) {
      toast({
        variant: 'destructive',
        title: 'Missing date',
        description: 'Please pick a date for the meeting.',
      });
      return;
    }
    if (!reminderClientName || !reminderTitle) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Client name and title are required.',
      });
      return;
    }

    setIsSavingReminder(true);
    try {
      const payload = {
        clientName: reminderClientName,
        title: reminderTitle,
        description: reminderDescription || null,
        date: reminderDate,
        time: reminderTime || null,
      };

      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save reminder');
      }

      toast({
        title: 'Reminder Saved',
        description: 'Meeting reminder has been scheduled.',
      });

      // reset form except client name (often reused)
      setReminderTitle('');
      setReminderDescription('');
      setReminderTime('');
      setReminderDate(selectedDate || new Date());

      await fetchRemindersForDate(selectedDate || new Date());
    } catch (error) {
      console.error('Create reminder error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not save reminder.',
      });
    } finally {
      setIsSavingReminder(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NOTE': return <StickyNote className="h-5 w-5" />;
      case 'TODO': return <ListTodo className="h-5 w-5" />;
      case 'IDEA': return <Lightbulb className="h-5 w-5" />;
      default: return null;
    }
  };

  const formatReminderDate = (iso: string) =>
    format(new Date(iso), 'MMM d, yyyy');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT COLUMN - BIN + CALENDAR */}
      <div className="xl:col-span-1 space-y-6">
        {/* CREATE ITEM FORM */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-base">
              <PlusCircle className="h-5 w-5" /> Add to Bin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateItem}>
              <div>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Quick note, to-do, or idea..."
                  required
                  disabled={isSubmitting}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select name="type" defaultValue="NOTE" disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="TODO">To-Do</SelectItem>
                    <SelectItem value="IDEA">Idea</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save to Bin'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CALENDAR VIEW */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Bin Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex justify-center">
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        {/* UPCOMING BIN ITEMS */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              Upcoming Bin Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingItems.map((item) => (
                <Card key={item.id} className="border border-border/50">
                  <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-full">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(
                            new Date((item as any).date || (item as any).createdAt),
                            'MMM d, yyyy'
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {upcomingItems.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted-foreground text-sm">
                    No upcoming items.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN - REMINDERS + BIN LIST */}
      <div className="xl:col-span-2 space-y-6">
        {/* REMINDER FORM */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader>
            <CardTitle className="font-headline flex flex-wrap items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Schedule Client Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateReminder}>
              <div className="grid gap-3 md:grid-cols-[2fr,1.5fr]">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Select client (optional)
                  </label>
                  <Select
                    onValueChange={(value) => {
                      const client = clients.find((c) => c.id === value);
                      if (client) {
                        setReminderClientName(
                          client.companyName
                            ? `${client.name} (${client.companyName})`
                            : client.name,
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pick from existing clients" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.companyName ? ` – ${c.companyName}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Or type client name
                  </label>
                  <Input
                    placeholder="Client name"
                    value={reminderClientName}
                    onChange={(e) => setReminderClientName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Meeting title
                  </label>
                  <Input
                    placeholder="e.g. Quarterly review call"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Time
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="Agenda, Zoom link, notes..."
                  value={reminderDescription}
                  onChange={(e) => setReminderDescription(e.target.value)}
                  className="min-h-[70px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start w-full sm:w-auto"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reminderDate
                        ? format(reminderDate, 'PPP')
                        : 'Pick meeting date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      selected={reminderDate}
                      onSelect={setReminderDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-xs text-muted-foreground">
                  Reminders will also show on your dashboard widget.
                </span>
              </div>

              <Button
                type="submit"
                disabled={isSavingReminder}
                className="w-full sm:w-auto"
              >
                {isSavingReminder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Reminder'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* REMINDERS LIST FOR SELECTED DATE */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Reminders for{' '}
              {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No meetings scheduled for this date.
              </p>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <Card key={rem.id} className="border border-border/50">
                    <CardContent className="py-3 px-4">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {rem.clientName}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {rem.title}
                          </p>
                          {rem.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {rem.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0">
                          <div>{formatReminderDate(rem.date)}</div>
                          {rem.time && <div>{rem.time}</div>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BIN ITEM LIST */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-base">
              Entries for {selectedDate ? format(selectedDate, 'PPP') : 'today'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {binItems.map((item) => (
                <Card key={item.id} className="border border-border/50">
                  <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-full">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(
                            new Date((item as any).date || (item as any).createdAt),
                            'MMM d, yyyy'
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {binItems.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">
                    No entries for this date. Add a note, to-do, or idea to get started.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
