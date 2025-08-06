
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Send, Trash2, LoaderCircle, MessageSquare, User, Bot, PanelLeftClose, PanelLeftOpen, Paperclip, Mic, Volume2, Sparkles, X } from 'lucide-react';
import { getSessions, createSession, deleteSession, getSessionMessages, getAnswer, getAudioForText, getTextForAudio, uploadFile } from '@/lib/chat-api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'model';
  message: string;
}

interface Session {
  id: string;
  name: string; 
}

export default function SahayakChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionSidebarOpen, setIsSessionSidebarOpen] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { settings, isSettingsLoaded } = useChatSettings();

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserId(JSON.parse(user).userId);
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    setTimeout(() => {
        const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }, 100);
  };
  
  const formatSessionName = (id: string) => `Session ${id.substring(0, 8)}...`;

  const loadSessions = useCallback(async (currentUserId: string) => {
    setIsLoading(true);
    try {
      const data = await getSessions(currentUserId);
      const formattedSessions = data.sessions.map((s: any) => ({ id: s.id, name: formatSessionName(s.id) }));
      setSessions(formattedSessions);
      if (formattedSessions.length > 0) {
        const firstSessionId = formattedSessions[0].id;
        setActiveSession(firstSessionId);
        if (data.messages) {
           setMessages(data.messages);
        } else {
           const sessionMessages = await getSessionMessages(currentUserId, firstSessionId);
           setMessages(sessionMessages.messages);
        }
      } else {
        await handleCreateSession(false);
      }
      scrollToBottom();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat sessions.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  

  useEffect(() => {
    if (userId) {
      loadSessions(userId);
    }
  }, [userId, loadSessions]);

  const handleCreateSession = async (setActive = true) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await createSession(userId);
      const newSession: Session = { id: data.session_id, name: formatSessionName(data.session_id) };
      setSessions(prev => [...prev, newSession]);
      if (setActive) {
        setActiveSession(newSession.id);
        setMessages([]);
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create a new session.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setActiveSession(sessionId);
    try {
      const data = await getSessionMessages(userId, sessionId);
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
        toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load session messages.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!userId) return;
    
    const originalSessions = sessions;
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    try {
      await deleteSession(userId, sessionId);
      if (activeSession === sessionId) {
        if (updatedSessions.length > 0) {
          const newActiveSession = updatedSessions[0];
          await handleSelectSession(newActiveSession.id);
        } else {
          setActiveSession(null);
          setMessages([]);
          await handleCreateSession(true);
        }
      }
    } catch (error) {
      setSessions(originalSessions);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session.",
      });
    }
  };

  const playAudio = async (text: string) => {
    if (!audioRef.current) return;
    setIsAudioPlaying(true);
    try {
        const audio = await getAudioForText(text);
        if (audio.media && audioRef.current) {
            audioRef.current.src = audio.media;
            audioRef.current.play();
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Failed to play audio. The text response is still available.",
        });
        setIsAudioPlaying(false);
        // We re-throw the error so handleSendMessage knows the audio failed.
        throw error;
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || !userId || !activeSession || !isSettingsLoaded) return;
    
    setIsSending(true);

    let uploadedFilename: string | undefined = undefined;

    // 1. Handle file upload if an attachment exists
    if (attachment) {
        try {
            const uploadResponse = await uploadFile(userId, activeSession, attachment);
            uploadedFilename = uploadResponse.filename;
            toast({
                title: "File Uploaded",
                description: `${uploadedFilename} has been uploaded successfully.`,
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Upload Failed",
                description: `Could not upload file: ${attachment.name}.`,
            });
            setIsSending(false);
            return;
        }
    }


    // 2. Send the message
    const userMessage: Message = { role: 'user', message: input || `Attached: ${uploadedFilename}` };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    scrollToBottom();

    let modelMessage: Message | null = null;
    
    try {
        const response = await getAnswer({
            user_id: userId,
            session_id: activeSession,
            message: userMessage.message,
            attachment_filename: uploadedFilename,
            target_grade_list: settings.targetGrades,
            response_tone: settings.tone,
            complexity: settings.complexity,
        });
        
        modelMessage = { role: 'model', message: response.message };
        setMessages(prev => [...prev, modelMessage!]);
        scrollToBottom();
        
        if (settings.voiceOutput) {
            await playAudio(modelMessage.message).catch(() => {
                // The error is already handled in playAudio.
            });
        }
        
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get a response from the AI.",
        });
        if (modelMessage) {
            setMessages(prev => prev.filter(m => m !== modelMessage));
        } else {
             setMessages(prev => prev.slice(0, -1));
        }
    } finally {
        setIsSending(false);
    }
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          try {
            const transcribedText = await getTextForAudio(base64Audio);
            setInput(prev => prev + transcribedText);
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Transcription Error",
              description: "Could not transcribe audio. Please try again.",
            });
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Stop all tracks to turn off the microphone indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const handleAttachmentClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setAttachment(file);
      }
  };

  const removeAttachment = () => {
      setAttachment(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };


  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
       <audio ref={audioRef} onEnded={() => setIsAudioPlaying(false)} className="hidden" />
      <div className={cn("flex flex-col transition-all duration-300", isSessionSidebarOpen ? "w-1/4" : "w-16")}>
        <Card className="flex-grow flex flex-col">
          <CardHeader className={cn("flex flex-row items-center", isSessionSidebarOpen ? "justify-between" : "justify-center")}>
            {isSessionSidebarOpen && <CardTitle>Sessions</CardTitle>}
            <div className="flex items-center gap-1">
                 {isSessionSidebarOpen && (
                     <Button variant="ghost" size="icon" onClick={() => handleCreateSession()} className="bg-google-yellow text-black hover:bg-[#F1F3F4] hover:text-google-yellow">
                        <Plus className="h-4 w-4" />
                    </Button>
                 )}
                <Button variant="ghost" size="icon" onClick={() => setIsSessionSidebarOpen(!isSessionSidebarOpen)}>
                    {isSessionSidebarOpen ? <PanelLeftClose className="h-5 w-5 text-yellow-500" /> : <PanelLeftOpen className="h-5 w-5 text-yellow-500" />}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-2">
              {sessions.map((session) => (
                <div key={session.id} className={cn("flex items-center gap-2", !isSessionSidebarOpen && "justify-center")}>
                  <Button
                    variant={activeSession === session.id ? "secondary" : "ghost"}
                    className={cn("flex-grow justify-start", !isSessionSidebarOpen && "w-10 justify-center")}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <MessageSquare className={cn("mr-2 h-4 w-4", !isSessionSidebarOpen && "mr-0")} />
                    {isSessionSidebarOpen && session.name}
                  </Button>
                  {isSessionSidebarOpen && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Sahayak Chat</CardTitle>
          <CardDescription>Your AI-powered teaching assistant.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
            {isLoading && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : messages.length === 0 ? (
                 <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Sparkles className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="mt-6 text-xl font-semibold">Welcome to Sahayak Chat</p>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                        This is your personal AI assistant. Start by asking a question, trying one of the examples, or using your microphone.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? 'justify-end' : '')}>
                    {m.role === 'model' && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        'rounded-lg px-4 py-2 max-w-[80%]',
                        m.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                         {m.role === 'model' && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 mt-1 text-muted-foreground hover:text-foreground"
                                onClick={() => playAudio(m.message).catch(() => {})}
                                disabled={isAudioPlaying}
                            >
                                <Volume2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {m.role === 'user' && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isSending && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted max-w-[80%] flex items-center">
                           <LoaderCircle className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                 )}
                </div>
            )}
          </ScrollArea>
           <form onSubmit={handleSendMessage} className="space-y-2 pt-4">
               {attachment && (
                    <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm font-medium truncate max-w-xs">{attachment.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={removeAttachment}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove attachment</span>
                        </Button>
                    </div>
                )}
                <div className="relative flex w-full items-end rounded-lg border bg-background pr-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                     <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as any);
                            }
                        }}
                        placeholder="Type your message or use the microphone..."
                        disabled={isSending || isTranscribing}
                        className="flex-1 max-h-36 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={1}
                    />
                    <div className="flex items-center gap-1 pb-1">
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground h-8 w-8" onClick={handleAttachmentClick}>
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                         <Button
                            type="button"
                            size="icon"
                            onClick={handleMicClick}
                            disabled={isTranscribing}
                            className={cn(
                                "h-8 w-8",
                                isRecording
                                ? "bg-white text-destructive animate-pulse border border-destructive"
                                : "bg-google-blue text-white hover:bg-google-blue/90"
                            )}
                            >
                            {isTranscribing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                             <span className="sr-only">{isRecording ? "Stop recording" : "Use Microphone"}</span>
                        </Button>
                        <Button type="submit" size="icon" className="h-8 w-8" disabled={isSending || isTranscribing || (!input.trim() && !attachment)}>
                            {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
