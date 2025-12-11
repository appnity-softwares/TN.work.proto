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
import { format } from 'date-fns';
import {
  PlusCircle,
  Trash,
  Loader2,
  StickyNote,
  ListTodo,
  Lightbulb,
  CalendarIcon,
} from 'lucide-react';

interface BinManagementProps {
  initialBinItems: Bin[];
}

export function BinManagement({ initialBinItems }: BinManagementProps) {
  const [binItems, setBinItems] = useState(initialBinItems);
  const [upcomingItems, setUpcomingItems] = useState<Bin[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

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

  useEffect(() => {
    if (selectedDate) {
      fetchBinItems(selectedDate);
    }
    fetchUpcomingItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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
      if (selectedDate) {
        fetchBinItems(selectedDate);
      }
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

      if (selectedDate) {
        fetchBinItems(selectedDate);
      }
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'NOTE': return <StickyNote className="h-5 w-5" />;
      case 'TODO': return <ListTodo className="h-5 w-5" />;
      case 'IDEA': return <Lightbulb className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
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
  );
}
