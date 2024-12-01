import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Plus, User, ChevronRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertFooter,
} from '../components/ui/alert';
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
} from '../components/ui/alert-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { auth } from '../config/firebase';
import AuthForm from './AuthForm';
import AgentDetailsDialog from '../components/ui/AgentDetailsDialog';
import ReactMarkdown from 'react-markdown';

const BlinkingText = ({ children, speed = 1000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <span className={visible ? 'opacity-100' : 'opacity-0'}>{children}</span>
  );
};

const WarningPattern = () => (
  <div className='absolute top-0 left-0 w-full h-full -z-10 opacity-10'>
    <div
      className='w-full h-full'
      style={{
        backgroundImage: `repeating-linear-gradient(
        45deg,
        #000,
        #000 10px,
        #ff0 10px,
        #ff0 20px
      )`,
      }}
    />
  </div>
);

const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

const GovAssistantPortal = () => {
  // State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState('welcome');
  const [selectedChat, setSelectedChat] = useState(null);
  const [assistants, setAssistants] = useState([]);
  const [assistantChats, setAssistantChats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  // const API_BASE_URL = 'http://localhost:8082';
  const API_BASE_URL =
    'https://ai-assistant-backend-834186850295.us-west1.run.app';
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentCallsign, setAgentCallsign] = useState('');
  const [operationalParams, setOperationalParams] = useState('');
  const [trainingData, setTrainingData] = useState(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  // Add these handler functions before your return statement
  const handleClearForm = () => {
    setAgentCallsign('');
    setOperationalParams('');
    setTrainingData(null);
    setIsPublic(true);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmitRequest = async () => {
    try {
      setLoading(true);
      const token = await getCurrentUserToken();

      const formData = new FormData();
      formData.append('file', trainingData);
      formData.append('callsign', agentCallsign);
      formData.append('parameters', operationalParams);
      formData.append('isPublic', isPublic);

      const response = await fetch(`${API_BASE_URL}/api/assistants`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Id': userId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();

      // Update local state
      setAssistants((prev) => [...prev, data]);
      handleClearForm();
      setActiveSection('assistants');

      // Show success message
      setError(null);
      // You could add a success message state and UI element here
    } catch (error) {
      setError('Failed to create agent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setTrainingData(file);
  };

  const isFormComplete = () => {
    return agentCallsign.trim() !== '' && trainingData !== null;
  };

  // Initialize clock
  const SystemClock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return <div>SYSTEM TIME: {currentTime.toLocaleTimeString()}</div>;
  };

  // Cyber Pop Up
  const handleComplete = () => {
    localStorage.setItem('securityTrainingCompleted', new Date().toISOString());
    setShowAlert(false);
  };

  const handlePostpone = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmPostpone = () => {
    localStorage.setItem('securityTrainingPostponed', new Date().toISOString());
    setShowConfirmDialog(false);
    setShowAlert(false);
  };

  const handleSectionChange = (section) => {
    setSelectedChat(null);
    setActiveSection(section);
    if (section === 'assistants') {
      fetchAssistants();
    }
  };

  // Initialize user session
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
      setActiveSection('assistants');
      fetchAssistants();
    }
  }, []);

  // API Functions
  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const token = await getCurrentUserToken();
      const response = await fetch(`${API_BASE_URL}/api/assistants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAssistants(data);
    } catch (error) {
      setError('Failed to fetch assistants: ' + error.message);
      console.error('Fetch assistants error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (assistantId) => {
    try {
      setLoading(true);
      const token = await getCurrentUserToken();
      const response = await fetch(
        `${API_BASE_URL}/api/assistants/${assistantId}/chats`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Id': userId,
          },
        }
      );
      const newChat = await response.json();
      setAssistantChats((prev) => ({
        ...prev,
        [assistantId]: [...(prev[assistantId] || []), newChat],
      }));
      setSelectedChat(newChat.id);
    } catch (error) {
      setError('Failed to create new chat');
      console.error('Create chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add authentication check on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCheckingAuth(false);
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setActiveSection('assistants');
        fetchAssistants(); // Only fetch here
      } else {
        setIsAuthenticated(false);
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handler for successful authentication
  const handleAuthSuccess = (user) => {
    setIsAuthenticated(true);
    setUserId(user.uid);
    setActiveSection('assistants');
    fetchAssistants();
  };

  // Chat Interface Component
  const ChatInterface = ({ chatId, assistantId, onChatCreated }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    // Modified to handle both existing and new chats
    useEffect(() => {
      if (chatId && chatId !== 'new') {
        fetchMessages();
      } else {
        setMessages([]);
      }
    }, [chatId]); // Added chatId as dependency

    const getCurrentUserToken = async () => {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    };

    const fetchMessages = async () => {
      if (!chatId || chatId === 'new') return;

      try {
        setLoading(true);
        setError(null);
        const token = await getCurrentUserToken();
        const response = await fetch(
          `${API_BASE_URL}/api/chats/${chatId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'User-Id': userId,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure data is an array and sort by timestamp
        setMessages(
          Array.isArray(data)
            ? data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            : []
        );
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setError('Failed to load message history');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    const TypingIndicator = () => (
      <div className='mb-4 p-2 font-mono text-sm bg-blue-100 border-l-4 border-blue-700 mr-8'>
        <div className='text-xs text-gray-600'>
          SYSTEM - {new Date().toLocaleTimeString()}
        </div>
        <div className='mt-1 flex items-center space-x-2'>
          <span>PROCESSING</span>
          <span className='inline-flex space-x-1'>
            <span className='animate-pulse'>.</span>
            <span className='animate-pulse' style={{ animationDelay: '0.2s' }}>
              .
            </span>
            <span className='animate-pulse' style={{ animationDelay: '0.4s' }}>
              .
            </span>
          </span>
        </div>
      </div>
    );

    const handleSend = async () => {
      if (!newMessage.trim()) return;

      const userMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
        chatId: chatId !== 'new' ? chatId : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage('');
      setIsTyping(true);

      try {
        const token = await getCurrentUserToken();
        const response = await fetch(
          `${API_BASE_URL}/api/assistants/${assistantId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'User-Id': userId,
            },
            body: JSON.stringify({
              content: userMessage.content,
              sender: 'user',
              chatId: chatId !== 'new' ? chatId : undefined,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const assistantMessage = await response.json();

        // Replace temporary message with actual message and add assistant response
        setMessages((prev) =>
          prev
            .map((msg) =>
              msg.id === userMessage.id
                ? {
                    ...assistantMessage,
                    sender: 'user',
                    content: userMessage.content,
                  }
                : msg
            )
            .concat([assistantMessage])
        );

        setError(null);

        // If this was a new chat, update the chatId
        if (chatId === 'new' && assistantMessage.chatId) {
          onChatCreated?.(assistantMessage.chatId);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setError('Failed to send message');
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsTyping(false); // Hide typing indicator
      }
    };

    return (
      <div className='flex flex-col h-[600px]'>
        {error && (
          <div className='bg-red-100 border-2 border-red-700 p-2 mb-2 font-mono text-sm text-red-700'>
            {error}
          </div>
        )}

        <div className='flex-grow overflow-y-auto bg-[#fffff0] border-2 border-gray-400 p-4'>
          {loading ? (
            <div className='text-center font-mono text-sm mt-4'>
              RETRIEVING COMMUNICATIONS...
            </div>
          ) : messages.length === 0 ? (
            <div className='text-center font-mono text-sm text-gray-600 mt-4'>
              {chatId === 'new'
                ? 'READY TO BEGIN NEW COMMUNICATION'
                : 'NO PREVIOUS COMMUNICATIONS FOUND'}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 p-2 font-mono text-sm ${
                    message.sender === 'user'
                      ? 'bg-green-100 border-l-4 border-green-700 ml-8'
                      : 'bg-blue-100 border-l-4 border-blue-700 mr-8'
                  }`}>
                  <div className='text-xs text-gray-600'>
                    {message.sender === 'user' ? 'OPERATOR' : 'SYSTEM'} -{' '}
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div className='mt-1 whitespace-pre-wrap'>
                    {message.sender === 'assistant' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className='border-t-2 border-gray-400 p-2 bg-gray-100'>
          <div className='flex space-x-2'>
            <input
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className='flex-grow p-2 font-mono border-2 border-gray-400 bg-[#fffff0]'
              placeholder='ENTER MESSAGE'
            />
            <button
              onClick={handleSend}
              className="bg-green-700 text-white px-4 py-2 font-['Courier_New'] text-sm
                       border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                       hover:translate-x-[1px] hover:translate-y-[1px]">
              TRANSMIT
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this new component inside GovAssistantPortal
  const CommunicationsView = ({ selectedAgent, setSelectedAgent }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
      if (selectedAgent) {
        fetchChatHistory(selectedAgent.id);
      }
    }, [selectedAgent]);

    const startNewChat = async () => {
      try {
        setLoading(true);
        const token = await getCurrentUserToken();
        const response = await fetch(
          `${API_BASE_URL}/api/assistants/${selectedAgent.id}/chats`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'User-Id': userId,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to create new chat');
        }

        const newChat = await response.json();
        setSelectedChat(newChat.id);
        setChatHistory((prev) => [...prev, newChat]);
      } catch (error) {
        setError('Failed to create chat: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchChatHistory = async (assistantId) => {
      try {
        setLoading(true);
        const token = await getCurrentUserToken();
        const response = await fetch(
          `${API_BASE_URL}/api/assistants/${assistantId}/chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'User-Id': userId,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }

        const data = await response.json();
        setChatHistory(data);
      } catch (error) {
        setError('Failed to fetch chat history: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    const handleChatCreated = (newChatId) => {
      setSelectedChat(newChatId);
      fetchChatHistory(selectedAgent.id);
    };

    return (
      <div className='space-y-4'>
        {!selectedAgent ? (
          <>
            <div className='bg-yellow-100 border-2 border-yellow-700 p-2 text-sm font-mono'>
              SELECT AN AGENT TO BEGIN COMMUNICATIONS
            </div>

            <div className='grid grid-cols-1 gap-2'>
              {assistants.map((assistant) => (
                <button
                  key={assistant.id}
                  onClick={() => setSelectedAgent(assistant)}
                  className='w-full border-2 border-gray-400 bg-blue-900 hover:bg-blue-800 text-white transition-colors'>
                  <div className='p-4 font-mono text-sm'>
                    <div className='flex items-start gap-3'>
                      <User className='h-4 w-4 mt-1 flex-shrink-0' />
                      <div className='flex-grow text-left'>
                        <div className='flex items-center gap-2'>
                          <span className='font-bold'>{assistant.name}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-sm ${
                              assistant.isPublic
                                ? 'bg-green-700 text-white'
                                : 'bg-red-700 text-white'
                            }`}>
                            {assistant.isPublic ? 'PUBLIC' : 'RESTRICTED'}
                          </span>
                        </div>
                        <div className='mt-1 text-xs text-gray-200 leading-tight'>
                          {assistant.parameters ||
                            'NO OPERATIONAL PARAMETERS DEFINED'}
                        </div>
                        <div className='text-xs text-gray-300 mt-1'>
                          AGENT ID: {assistant.id.slice(-8)}
                        </div>
                      </div>
                      <ChevronRight className='h-4 w-4 flex-shrink-0 mt-1' />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setSelectedChat(null);
                  setChatHistory([]);
                }}
                className='bg-gray-200 px-4 py-2 font-mono text-sm border-2 border-black
                         shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                         hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[1px] hover:translate-y-[1px]'>
                ◄ BACK TO AGENTS
              </button>
              <div className='font-mono text-sm'>
                COMMUNICATING WITH: {selectedAgent.name}
              </div>
            </div>

            {/* Chat History Section */}
            {!selectedChat && (
              <div className='border-2 border-gray-400 bg-[#fffff0] p-4'>
                <div className='font-mono text-sm mb-4'>
                  COMMUNICATION ARCHIVES:
                </div>
                {loading ? (
                  <div className='text-center p-4 font-mono text-sm'>
                    RETRIEVING ARCHIVES...
                  </div>
                ) : chatHistory.length > 0 ? (
                  <div className='space-y-2'>
                    {chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className='w-full p-3 text-left font-mono text-sm border-2 border-gray-400
                                 bg-gray-100 hover:bg-yellow-100 flex items-center justify-between'>
                        <div>
                          <div>CHAT ID: {chat.id.slice(-8)}</div>
                          <div className='text-xs text-gray-600'>
                            INITIATED:{' '}
                            {new Date(chat.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <ChevronRight className='h-4 w-4' />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className='text-center p-4 font-mono text-sm text-gray-600'>
                    NO PREVIOUS COMMUNICATIONS FOUND
                  </div>
                )}

                <button
                  onClick={startNewChat}
                  className='w-full mt-4 p-3 bg-green-700 text-white font-mono text-sm
                           border-2 border-black hover:bg-green-800
                           shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[1px] hover:translate-y-[1px]'>
                  ► INITIALIZE NEW COMMUNICATION CHANNEL
                </button>
              </div>
            )}

            {/* Active Chat Interface */}
            {selectedChat && (
              <>
                <div className='flex justify-between items-center'>
                  <button
                    onClick={() => setSelectedChat(null)}
                    className='bg-gray-200 px-4 py-2 font-mono text-sm border-2 border-black
                       shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                       hover:translate-x-[1px] hover:translate-y-[1px]'>
                    ◄ BACK TO CHAT LIST
                  </button>
                  <div className='font-mono text-xs'>
                    {selectedChat === 'new'
                      ? 'NEW COMMUNICATION'
                      : `CHAT ID: ${selectedChat.slice(-8)}`}
                  </div>
                </div>
                <ChatInterface
                  chatId={selectedChat}
                  assistantId={selectedAgent.id}
                  onChatCreated={handleChatCreated}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Assistant List Component
  const AssistantList = ({ onSectionChange, setSelectedAgent }) => {
    const handleStartCommunication = async (assistant) => {
      setSelectedAgent(assistant);
      onSectionChange('messages');
    };

    return (
      <div className='space-y-2'>
        {/* Create New Assistant Button */}
        <div className='border-2 border-gray-400 bg-[#f0f0f0]'>
          <button
            onClick={() => onSectionChange('create')}
            className='w-full p-2 text-left font-mono text-sm bg-green-700 text-white hover:bg-green-800 flex items-center'>
            <Plus className='h-4 w-4 mr-2' /> REQUEST NEW AGENT
          </button>
        </div>

        {assistants.map((assistant) => (
          <button
            key={assistant.id}
            onClick={() => handleStartCommunication(assistant)}
            className='w-full border-2 border-gray-400 bg-blue-900 hover:bg-blue-800 text-white transition-colors'>
            <div className='p-4 font-mono text-sm'>
              <div className='flex items-start gap-3'>
                <User className='h-4 w-4 mt-1 flex-shrink-0' />
                <div className='flex-grow text-left'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold'>{assistant.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-sm ${
                        assistant.isPublic
                          ? 'bg-green-700 text-white'
                          : 'bg-red-700 text-white'
                      }`}>
                      {assistant.isPublic ? 'PUBLIC' : 'RESTRICTED'}
                    </span>
                  </div>
                  <div className='mt-1 text-xs text-gray-200 leading-tight'>
                    {assistant.parameters ||
                      'NO OPERATIONAL PARAMETERS DEFINED'}
                  </div>
                  <div className='text-xs text-gray-300 mt-1 flex items-center'>
                    <span>AGENT ID: {assistant.id.slice(-8)}</span>
                  </div>
                </div>
                <ChevronRight className='h-4 w-4 flex-shrink-0 mt-1' />
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  if (checkingAuth) {
    return (
      <div className='min-h-screen bg-[#fffff0] flex items-center justify-center'>
        <div className="font-['Courier_New'] text-center space-y-4">
          <div className='text-2xl font-bold'>INITIALIZING SYSTEM</div>
          <div className='text-sm'>VERIFYING SECURITY CREDENTIALS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#fffff0]'>
      {/* Security Training Alert */}
      {showAlert && (
        <Alert variant='warning'>
          <AlertTitle>SYSTEM SECURITY NOTICE</AlertTitle>
          <AlertDescription>
            <div className='space-y-2'>
              <p>TO ALL DEPARTMENT DIRECTIVE 1972-07:</p>
              <p>
                ALL USERS MUST VERIFY COMPLETION OF ANNUAL CYBERSECURITY
                TRAINING BEFORE ACCESSING THIS SYSTEM.
              </p>
            </div>
          </AlertDescription>
          <AlertFooter
            onComplete={handleComplete}
            onPostpone={handlePostpone}
          />
        </Alert>
      )}

      {/* Security Alert Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogPortal>
          <AlertDialogOverlay className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm' />
          <AlertDialogPrimitive.Content
            className='fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] 
                    w-full max-w-lg border-4 border-black bg-[#fffff0]
                    shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]'>
            <div className='bg-red-700 text-white px-4 py-2 border-b-4 border-black flex items-center justify-between'>
              <BlinkingText speed={800}>⚠ SECURITY ALERT ⚠</BlinkingText>
              <div className='text-xs'>
                REF: {Math.random().toString(36).substr(2, 6).toUpperCase()}
              </div>
            </div>

            <div className='relative p-6'>
              <WarningPattern />
              <div className='text-center mb-6'>
                <div className='font-bold text-xl mb-1'>
                  !! POSTPONEMENT REQUEST !!
                </div>
                <div className='text-red-700 font-mono text-sm'>
                  <BlinkingText speed={600}>
                    --- REQUIRES IMMEDIATE ATTENTION ---
                  </BlinkingText>
                </div>
              </div>

              <div className='border border-gray-400 bg-gray-100 p-3 mb-6 font-mono text-sm'>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    STATUS: <span className='text-red-700'>PENDING</span>
                  </div>
                  <div>
                    CLEARANCE: <span className='text-orange-700'>REVIEW</span>
                  </div>
                  <div>
                    RISK LEVEL: <span className='text-red-700'>ELEVATED</span>
                  </div>
                  <div>
                    OVERRIDE: <BlinkingText>REQUIRED</BlinkingText>
                  </div>
                </div>
              </div>

              <div className='flex justify-end space-x-3 pt-4 border-t-2 border-gray-400'>
                <AlertDialogPrimitive.Cancel
                  className='bg-gray-200 px-4 py-2 font-mono text-sm
                           border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[1px] hover:translate-y-[1px]'>
                  ◄ CANCEL REQUEST
                </AlertDialogPrimitive.Cancel>
                <AlertDialogPrimitive.Action
                  onClick={handleConfirmPostpone}
                  className='bg-red-700 text-white px-4 py-2 font-mono text-sm
                           border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[1px] hover:translate-y-[1px]
                           relative overflow-hidden'>
                  <BlinkingText speed={400}>
                    !! CONFIRM OVERRIDE !!
                  </BlinkingText>
                </AlertDialogPrimitive.Action>
              </div>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPortal>
      </AlertDialog>

      {/* Top Banner */}
      <div className='bg-blue-900 text-white text-xs py-1 text-center font-mono border-b-2 border-red-700'>
        OFFICIAL USE ONLY • SYSTEM ACCESS MONITORED • LAST UPDATED: 03/15/1984
      </div>

      {/* Header with retro logo */}
      <header className='bg-gradient-to-b from-blue-900 to-blue-800 text-white p-4'>
        <div className='container mx-auto'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              {/* ASCII Art Style Logo */}
              <div className='font-mono text-xs whitespace-pre hidden md:block text-yellow-300'>
                {`███████╗░█████╗░██╗
██╔════╝██╔══██╗██║
█████╗░░███████║██║
██╔══╝░░██╔══██║██║
██║░░░░░██║░░██║██║
╚═╝░░░░░╚═╝░░╚═╝╚═╝`}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-['Courier_New'] tracking-tight">
                  FEDERAL ARTIFICIAL INTELLIGENCE
                </h1>
                <h2 className="text-sm font-['Courier_New'] text-yellow-300">
                  DEPARTMENT OF ADVANCED COMPUTATIONAL SYSTEMS
                </h2>
              </div>
            </div>
            <div className='text-right font-mono text-xs'>
              <SystemClock />
              <div>STATUS: MAYBE OPERATIONAL?</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className='bg-gray-200 border-y border-gray-400 text-xs'>
        <div className='container mx-auto'>
          <marquee className='py-1 text-red-700 font-bold'>
            *** NOTICE: This system requires Internet Explorer 6.0 or Netscape
            Navigator 7.0 for optimal viewing ***
          </marquee>
        </div>
      </div>

      <main className='container mx-auto p-4 flex-grow'>
        {!isAuthenticated ? (
          <Card className='max-w-2xl mx-auto mt-10 border-4 border-gray-700 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]'>
            <CardHeader className='bg-gradient-to-r from-blue-900 to-blue-800 text-white'>
              <CardTitle className="text-center font-['Courier_New']">
                -=-=-=-=-= SECURE LOGIN REQUIRED =-=-=-=-=-
              </CardTitle>
            </CardHeader>
            <CardContent className='bg-[#ffffd0] p-6'>
              <div className='border-2 border-red-700 bg-red-100 p-4 mb-6'>
                <div className='flex items-start space-x-2'>
                  <div className='text-red-700 text-2xl leading-none'>⚠</div>
                  <div className='font-mono text-sm text-red-700'>
                    WARNING: This is a U.S. Government information system. By
                    using this system you consent to monitoring and searches as
                    described in the SYSTEM PRIVACY NOTICE [REF-1978-03].
                  </div>
                </div>
              </div>

              <div className="space-y-4 font-['Courier_New']">
                <div className='border border-gray-400 p-4 bg-white'>
                  <table className='w-full text-sm'>
                    <tbody>
                      <tr>
                        <td className='py-2'>SYSTEM STATUS:</td>
                        <td className='text-green-700'>■ ONLINE</td>
                      </tr>
                      <tr>
                        <td className='py-2'>SECURITY LEVEL:</td>
                        <td>LEVEL 3 - RESTRICTED</td>
                      </tr>
                      <tr>
                        <td className='py-2'>CONNECTIONS:</td>
                        <td className='text-blue-700'>█████ ACTIVE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {error && (
                  <div className='text-red-700 text-sm text-center border-t border-red-300 pt-4'>
                    SYSTEM ERROR: {error}
                  </div>
                )}

                <AuthForm onAuthSuccess={handleAuthSuccess} />

                <div className='text-xs text-center text-gray-600 border-t border-gray-300 pt-4'>
                  Having trouble accessing the system? Contact SYSADMIN at:
                  <br />
                  <span className='font-mono'>SEC-ADMIN-5[at]DEPT.GOV</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-4 gap-4'>
            {/* Left Sidebar */}
            <div className='col-span-1'>
              <div className='border-4 border-gray-700 bg-[#f0f0f0] p-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]'>
                <div className="bg-blue-900 text-white p-2 font-['Courier_New'] text-center mb-2">
                  SYSTEM NAVIGATION
                </div>
                <nav className='space-y-1'>
                  {[
                    { id: 'assistants', label: 'AVAILABLE AGENTS', icon: User },
                    { id: 'create', label: 'REQUEST NEW AGENT', icon: Plus },
                    {
                      id: 'messages',
                      label: 'COMMUNICATIONS',
                      icon: MessageSquare,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full text-left p-2 text-sm font-['Courier_New'] flex items-center space-x-2
                              border-2 hover:bg-yellow-100 ${
                                activeSection === item.id
                                  ? 'bg-yellow-200 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                  : 'border-gray-400'
                              }`}>
                      <item.icon className='h-4 w-4' />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className='mt-4 border border-gray-400 bg-white p-2'>
                  <div className='text-xs font-mono'>
                    <div className='text-orange-700'>█ SYSTEM STRUGGLING</div>
                    <div>► CPU: 99.97% UTILIZED</div>
                    <div>► MEM: 0.00102KB FREE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className='col-span-3'>
              <div className='border-4 border-gray-700 bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]'>
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-2 font-['Courier_New'] flex justify-between items-center">
                  <span>CURRENT OPERATION: {activeSection.toUpperCase()}</span>
                  <span className='text-xs'>
                    REF: {Math.random().toString(36).substr(2, 9)}
                  </span>
                </div>

                <div className='p-4'>
                  {loading && (
                    <div className='text-center p-4 font-mono text-sm'>
                      PROCESSING REQUEST... PLEASE STAND BY...
                    </div>
                  )}

                  {error && (
                    <div className='bg-red-100 border-2 border-red-700 p-2 mb-4 font-mono text-sm text-red-700'>
                      SYSTEM ERROR: {error}
                    </div>
                  )}

                  {/* Conditional Rendering Based on Active Section */}
                  {activeSection === 'assistants' && (
                    <AssistantList
                      onSectionChange={handleSectionChange}
                      setSelectedAgent={setSelectedAgent}
                      onAgentSelect={(agent) => {
                        setSelectedAssistant(agent);
                        setShowAgentDetails(true);
                      }}
                    />
                  )}

                  {activeSection === 'create' && (
                    <div className='space-y-4'>
                      <div className='bg-yellow-100 border-2 border-yellow-700 p-2 text-sm font-mono'>
                        NOTICE: All new agent requests require Level 4 clearance
                        approval
                      </div>

                      <div className='space-y-3'>
                        <label className='block'>
                          <span className="font-['Courier_New'] text-sm">
                            CODENAME:
                          </span>
                          <input
                            type='text'
                            value={agentCallsign}
                            onChange={(e) => setAgentCallsign(e.target.value)}
                            className='w-full mt-1 p-2 font-mono border-2 border-gray-400 bg-[#fffff0]'
                            placeholder='ENTER AGENT CODENAME'
                          />
                        </label>

                        <div className='border-2 border-gray-400 p-3 bg-[#fffff0]'>
                          <span className="font-['Courier_New'] text-sm mb-2 block">
                            ACCESS LEVEL:
                          </span>
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => setIsPublic(true)}
                              className={`flex-1 p-2 font-['Courier_New'] text-sm border-2 
                                      ${
                                        isPublic
                                          ? 'bg-green-700 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                          : 'bg-gray-200 border-gray-400'
                                      }`}>
                              【 PUBLIC 】
                              <div className='text-xs mt-1'>
                                {isPublic && '► '}GENERAL ACCESS PERMITTED
                              </div>
                            </button>
                            <button
                              onClick={() => setIsPublic(false)}
                              className={`flex-1 p-2 font-['Courier_New'] text-sm border-2 
                                      ${
                                        !isPublic
                                          ? 'bg-red-700 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                          : 'bg-gray-200 border-gray-400'
                                      }`}>
                              【 PRIVATE 】
                              <div className='text-xs mt-1'>
                                {!isPublic && '► '}RESTRICTED ACCESS ONLY
                              </div>
                            </button>
                          </div>
                          {!isPublic && (
                            <div className='mt-2 p-2 bg-red-100 border border-red-700 text-xs font-mono'>
                              WARNING: Private agents require additional
                              security clearance verification
                            </div>
                          )}
                        </div>

                        <label className='block'>
                          <span className="font-['Courier_New'] text-sm">
                            OPERATIONAL PARAMETERS:
                          </span>
                          <textarea
                            value={operationalParams}
                            onChange={(e) =>
                              setOperationalParams(e.target.value)
                            }
                            className='w-full mt-1 p-2 font-mono border-2 border-gray-400 bg-[#fffff0]'
                            rows='4'
                            placeholder='DEFINE AGENT PARAMETERS'
                          />
                        </label>

                        <label className='block'>
                          <span className="font-['Courier_New'] text-sm">
                            UPLOAD TRAINING DATA:
                          </span>
                          <div className='mt-1 p-2 border-2 border-gray-400 bg-[#fffff0]'>
                            <input
                              type='file'
                              onChange={handleFileChange}
                              className='font-mono text-sm'
                            />
                          </div>
                        </label>

                        {/* Add validation message right before the buttons */}
                        {!isFormComplete() && (
                          <div className='text-red-700 text-xs font-mono mt-2'>
                            REQUIRED:{' '}
                            {[
                              !agentCallsign.trim() && 'AGENT CODENAME',
                              !trainingData && 'TRAINING DATA',
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </div>
                        )}

                        <div className='pt-4 space-x-2'>
                          <button
                            onClick={handleSubmitRequest}
                            disabled={!isFormComplete() || loading}
                            className={`px-4 py-2 font-['Courier_New'] text-sm
             border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
             hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
             hover:translate-x-[1px] hover:translate-y-[1px]
             disabled:cursor-not-allowed
             ${
               isFormComplete() && !loading
                 ? 'bg-green-700 text-white hover:bg-green-800'
                 : 'bg-gray-400 text-gray-200'
             }`}>
                            {loading ? 'PROCESSING...' : 'SUBMIT REQUEST'}
                          </button>
                          <button
                            onClick={handleClearForm}
                            disabled={loading}
                            className="bg-gray-200 px-4 py-2 font-['Courier_New'] text-sm
                   border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                   hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                   hover:translate-x-[1px] hover:translate-y-[1px]
                   disabled:opacity-50 disabled:cursor-not-allowed">
                            CLEAR FORM
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'messages' && (
                    <CommunicationsView
                      selectedAgent={selectedAgent}
                      setSelectedAgent={setSelectedAgent}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='bg-blue-900 text-white p-4 border-t-4 border-red-700 mt-auto'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono'>
            <div>
              <div className='mb-2 border-b border-gray-500'>
                SYSTEM INFORMATION
              </div>
              <div>VERSION: 2.3.451</div>
              <div>BUILD: 19660324_STABLE</div>
              <div>PROTOCOL: SECURE_HTTPS_TLS</div>
            </div>
            <div>
              <div className='mb-2 border-b border-gray-500'>AUTHORIZATION</div>
              <div>CLASSIFICATION: RESTRICTED</div>
              <div>ACCESS LEVEL: 5</div>
              <div>CLEARANCE: PENDING</div>
            </div>
            <div>
              <div className='mb-2 border-b border-gray-500'>SUPPORT</div>
              <div>TEL: 1-800-555-0123</div>
              <div>HOURS: 0800-1700 EST</div>
              <div>PRIORITY: NORMAL</div>
            </div>
          </div>
          <div className='text-center mt-4 text-xs'>
            <div>OFFICIAL U.S. GOVERNMENT SYSTEM • FOR AUTHORIZED USE ONLY</div>
            <div>© 1968-{new Date().getFullYear()} ALL RIGHTS RESERVED</div>
          </div>
        </div>
      </footer>

      <AgentDetailsDialog
        open={showAgentDetails}
        onOpenChange={setShowAgentDetails}
        agent={selectedAssistant}
        onStartChat={() => {
          setShowAgentDetails(false);
          setSelectedAgent(selectedAssistant);
          handleSectionChange('messages');
          createNewChat(selectedAssistant.id);
        }}
      />
    </div>
  );
};

export default GovAssistantPortal;
