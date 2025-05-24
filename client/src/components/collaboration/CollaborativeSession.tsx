import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types for collaborative sessions
interface SessionMessage {
  sender: string;
  content: string;
  timestamp: Date;
  type: 'chat' | 'action' | 'system';
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  author: string;
  color: string;
  timestamp: Date;
}

interface Session {
  id: string;
  name: string;
  owner: string;
  createdAt: Date;
  participantCount: number;
  simulationId: number;
  departmentType: string;
  currentStep?: number;
  messages: SessionMessage[];
  annotations?: Annotation[];
}

interface CollaborativeSessionProps {
  username: string;
  userId: string;
  simulationId: number;
  departmentType: string;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

export function CollaborativeSession({
  username,
  userId,
  simulationId,
  departmentType,
  onStepChange,
  currentStep = 0
}: CollaborativeSessionProps) {
  // State
  const [activeTab, setActiveTab] = useState<'session' | 'chat'>('session');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [message, setMessage] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // WebSocket connection
  const { isConnected, sendMessage, lastMessage } = useWebSocket({
    onMessage: handleWebSocketMessage
  });

  // Load available sessions
  useEffect(() => {
    fetch('/api/sessions')
      .then(response => response.json())
      .then(data => {
        setSessions(data);
      })
      .catch(error => {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load collaborative sessions',
          variant: 'destructive'
        });
      });
  }, [toast]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current && currentSession?.messages) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages]);

  // Handle step change from parent component
  useEffect(() => {
    if (currentSession && currentStep !== currentSession.currentStep) {
      sendStepChangeMessage(currentStep);
    }
  }, [currentStep, currentSession]);

  // Handle WebSocket messages
  function handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'session_created':
        toast({
          title: 'Session Created',
          description: `Your session "${data.session.name}" is ready`
        });
        setCurrentSession(data.session);
        setIsCreatingSession(false);
        break;

      case 'session_joined':
        toast({
          title: 'Session Joined',
          description: `You've joined "${data.session.name}"`
        });
        setCurrentSession(data.session);
        break;

      case 'chat_message':
        if (currentSession) {
          setCurrentSession({
            ...currentSession,
            messages: [...currentSession.messages, data.message]
          });
        }
        break;

      case 'participant_joined':
        if (currentSession) {
          toast({
            title: 'New Participant',
            description: `${data.username} has joined the session`
          });
          setCurrentSession({
            ...currentSession,
            participantCount: data.participantCount,
            messages: [...currentSession.messages, data.message]
          });
        }
        break;

      case 'participant_left':
        if (currentSession) {
          setCurrentSession({
            ...currentSession,
            participantCount: data.participantCount,
            messages: [...currentSession.messages, data.message]
          });
        }
        break;

      case 'step_changed':
        if (currentSession) {
          setCurrentSession({
            ...currentSession,
            currentStep: data.step,
            messages: [...currentSession.messages, data.message]
          });
          
          if (onStepChange && data.step !== currentStep) {
            onStepChange(data.step);
          }
        }
        break;

      case 'annotation_added':
        if (currentSession && currentSession.annotations) {
          setCurrentSession({
            ...currentSession,
            annotations: [...currentSession.annotations, data.annotation]
          });
        }
        break;

      case 'session_sync':
        if (currentSession) {
          setCurrentSession({
            ...currentSession,
            currentStep: data.currentStep,
            messages: data.messages,
            annotations: data.annotations,
            participantCount: data.participantCount
          });
        }
        break;

      case 'error':
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive'
        });
        break;
    }
  }

  // Create a new collaborative session
  function createSession() {
    if (!newSessionName.trim()) {
      toast({
        title: 'Session Name Required',
        description: 'Please enter a name for your collaborative session',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingSession(true);
    sendMessage({
      type: 'create',
      userId,
      username,
      sessionName: newSessionName,
      simulationId,
      departmentType
    });
  }

  // Join an existing session
  function joinSession(sessionId: string) {
    sendMessage({
      type: 'join',
      sessionId,
      userId,
      username
    });
  }

  // Leave current session
  function leaveSession() {
    if (currentSession) {
      sendMessage({
        type: 'leave',
        sessionId: currentSession.id,
        userId,
        username
      });
      setCurrentSession(null);
    }
  }

  // Send a chat message
  function sendChatMessage() {
    if (!message.trim() || !currentSession) return;

    sendMessage({
      type: 'chat',
      sessionId: currentSession.id,
      userId,
      username,
      content: message
    });

    setMessage('');
  }

  // Send annotation
  function sendAnnotation(x: number, y: number, text: string, color: string) {
    if (!currentSession) return;

    sendMessage({
      type: 'annotation',
      sessionId: currentSession.id,
      userId,
      username,
      x,
      y,
      text,
      color
    });
  }

  // Send step change
  function sendStepChangeMessage(step: number) {
    if (!currentSession) return;

    sendMessage({
      type: 'step',
      sessionId: currentSession.id,
      userId,
      username,
      step
    });
  }

  // Request session sync
  function requestSync() {
    if (!currentSession) return;

    sendMessage({
      type: 'sync',
      sessionId: currentSession.id,
      userId
    });
  }

  // Format timestamp
  function formatTime(timestamp: Date | string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Render message
  function renderMessage(msg: SessionMessage, index: number) {
    const isCurrentUser = msg.sender === username;
    const isSystem = msg.type === 'system';
    const isAction = msg.type === 'action';

    if (isSystem || isAction) {
      return (
        <div key={index} className="flex justify-center my-2">
          <div className="bg-muted/50 text-muted-foreground text-xs py-1 px-3 rounded-full">
            {isAction ? (
              <span>
                <span className="font-medium">{msg.sender}</span> {msg.content}
              </span>
            ) : (
              msg.content
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className="flex items-start max-w-[80%]">
          {!isCurrentUser && (
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="text-xs">
                {msg.sender.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <div
              className={`px-3 py-2 rounded-lg ${
                isCurrentUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {!isCurrentUser && (
                <div className="text-xs font-medium mb-1">{msg.sender}</div>
              )}
              <p className="text-sm">{msg.content}</p>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatTime(msg.timestamp)}
            </div>
          </div>
          {isCurrentUser && (
            <Avatar className="h-8 w-8 ml-2">
              <AvatarFallback className="text-xs">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  }

  // If not connected to WebSocket
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborative Sessions</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4 text-muted-foreground">
            Connecting to collaboration server...
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show session list or creation form if no current session
  if (!currentSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborative Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isCreatingSession ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Create New Session</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a name for your collaborative session.
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Session Name"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button onClick={createSession}>Create Session</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingSession(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Available Sessions</h3>
                <Button onClick={() => setIsCreatingSession(true)}>
                  Create New
                </Button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active sessions found. Create a new one to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{session.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.participantCount} participant
                          {session.participantCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => joinSession(session.id)}
                      >
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Current session view
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{currentSession.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {currentSession.participantCount} participant
              {currentSession.participantCount !== 1 ? 's' : ''}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={leaveSession}>
            Leave Session
          </Button>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="mx-4">
          <TabsTrigger value="session">Session</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="session" className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Current Step</h3>
            <div className="flex items-center space-x-2">
              <Badge>{currentSession.currentStep !== undefined ? currentSession.currentStep + 1 : 1}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={requestSync}
              >
                Sync with Group
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium">Recent Activity</h3>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {currentSession.messages
                .filter(msg => msg.type === 'action' || msg.type === 'system')
                .slice(-10)
                .map((msg, index) => (
                  <div key={index} className="py-1 text-sm">
                    <span className="text-xs text-muted-foreground mr-2">
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.type === 'action' ? (
                      <span>
                        <span className="font-medium">{msg.sender}</span> {msg.content}
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                ))}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 pt-4">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1 pb-4">
              {currentSession.messages.map((msg, index) => renderMessage(msg, index))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <CardFooter className="border-t pt-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <Button onClick={sendChatMessage}>Send</Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}