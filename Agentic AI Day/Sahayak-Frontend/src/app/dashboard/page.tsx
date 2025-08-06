
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lightbulb, Calendar, History, FileText, LoaderCircle, Star, Clock, BookOpen, Link as LinkIcon } from "lucide-react";
import { getAnswer, createSession, getSessions } from '@/lib/chat-api';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DEFAULT_THOUGHT = '"The beautiful thing about learning is that nobody can take it away from you." - B.B. King';
const THOUGHT_OF_THE_DAY_USER_ID = 'thought-of-day';

function ThoughtOfTheDayCard() {
  const [thought, setThought] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { settings, isSettingsLoaded } = useChatSettings();

  useEffect(() => {
    if (!isSettingsLoaded) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 10000);

    const fetchThought = async () => {
      try {
        let sessionId: string;
        const data = await getSessions(THOUGHT_OF_THE_DAY_USER_ID);
        if (data.sessions && data.sessions.length > 0) {
            sessionId = data.sessions[0].id;
        } else {
            const newSession = await createSession(THOUGHT_OF_THE_DAY_USER_ID);
            sessionId = newSession.session_id;
        }

        const userLocation = settings.state ? `${settings.state}, India` : 'India';
        const response = await getAnswer({
          user_id: THOUGHT_OF_THE_DAY_USER_ID,
          session_id: sessionId,
          message: `Give me thought of the day. I'm from ${userLocation}.`,
          target_grade_list: [],
          response_tone: 'inspirational',
          complexity: 'simple',
        });
        setThought(response.message);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            console.warn('Could not fetch thought of the day, showing default.', error);
        }
        setThought(DEFAULT_THOUGHT);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    fetchThought();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };

  }, [isSettingsLoaded, settings.state]);

  return (
     <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            <span>Thought of the Day</span>
        </CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    <span>Fetching today's thought...</span>
                 </div>
            ) : (
                <p className="text-lg italic text-muted-foreground">{thought}</p>
            )}
        </CardContent>
    </Card>
  )
}

function AuthHandler() {
    const searchParams = useSearchParams();
  
    useEffect(() => {
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const picture = searchParams.get('picture');
  
      if (email && name && picture) {
        const user = {
          userId: email,
          name: name,
          picture: picture,
          isAdmin: false, 
        };
        localStorage.setItem('user', JSON.stringify(user));
        // Clean up URL
        window.history.replaceState(null, '', '/dashboard');
        // Force a re-render or state update in parent if necessary,
        // though UserNav will pick up the change on its next render.
        window.dispatchEvent(new Event('storage'));
      }
    }, [searchParams]);
  
    return null;
}

const dummyHistory = [
    { id: 1, title: "Lesson Plan for Grade 5 Science", url: "#" },
    { id: 2, title: "Math Worksheet Generator", url: "#" },
    { id: 3, title: "Classroom Management Techniques", url: "#" },
];

const dummyStarred = [
    { id: 1, title: "Annual Curriculum Outline", url: "#" },
    { id: 2, title: "Interactive History Timeline Tool", url: "#" },
];

function DashboardPageContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your activities.</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <ThoughtOfTheDayCard />
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-500" />
                <span>Agenda &amp; Exams</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground"/>Today's Agenda</h3>
                    <p className="text-muted-foreground text-sm pl-7">No events scheduled for today.</p>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-muted-foreground"/>Extra Classes (Next 2 Weeks)</h3>
                    <p className="text-muted-foreground text-sm pl-7">No extra classes scheduled.</p>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground"/>Scheduled Exams (Next 2 Months)</h3>
                    <p className="text-muted-foreground text-sm pl-7">Mid-term exams starting next month.</p>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-green-500" />
                <span>History</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="history">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="history">Recent</TabsTrigger>
                        <TabsTrigger value="starred">Starred</TabsTrigger>
                    </TabsList>
                    <TabsContent value="history" className="mt-4 space-y-2">
                        {dummyHistory.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <a href={item.url} className="text-sm hover:underline flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                                    {item.title}
                                </a>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Star className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                    <TabsContent value="starred" className="mt-4 space-y-2">
                         {dummyStarred.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <a href={item.url} className="text-sm hover:underline flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                                    {item.title}
                                </a>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthHandler />
            <DashboardPageContent />
        </Suspense>
    )
}
