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

  const getIcon = (type: string) => {
    switch (type) {
      case 'NOTE': return <StickyNote className="h-5 w-5" />;
      case 'TODO': return <ListTodo className="h-5 w-5" />;
      case 'IDEA': return <Lightbulb className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        {/* CREATE ITEM FORM */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <PlusCircle className="h-6 w-6" /> Add to Bin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateItem}>
              <div>
                <Textarea id="content" name="content" placeholder="What's on your mind?" required disabled={isSubmitting} />
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
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CALENDAR VIEW */}
        <Card className="glass">
          <CardContent className="p-2 flex justify-center">
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        {/* UPCOMING ITEMS */}
        <Card className="glass">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    Upcoming
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingItems.map((item) => (
                        <Card key={item.id} className="glass">
                            <CardContent className="p-4 flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-100 rounded-full">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">{item.content}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                        {format(new Date(item.date || item.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {upcomingItems.length === 0 && (
                        <div className="text-center py-5">
                            <p className="text-muted-foreground">No upcoming items.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* ITEM LIST */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          <h2 className="font-headline text-2xl">Entries for {selectedDate ? format(selectedDate, 'PPP') : 'today'}</h2>
          {binItems.map((item) => (
            <Card key={item.id} className="glass">
              <CardContent className="p-4 flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                        {getIcon(item.type)}
                    </div>
                    <div>
                        <p className="text-sm text-gray-700">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(item.date || item.createdAt), 'MMM d, yyyy')}
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
                  <p className="text-muted-foreground">No entries for this date. Add a note, to-do, or idea to get started.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
