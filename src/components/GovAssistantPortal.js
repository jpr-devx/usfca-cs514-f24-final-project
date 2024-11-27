import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Plus, User } from 'lucide-react';
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

const GovAssistantPortal = () => {
  // State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeSection, setActiveSection] = useState('welcome');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChat, setSelectedChat] = useState(null);
  const [assistants, setAssistants] = useState([]);
  const [expandedAssistant, setExpandedAssistant] = useState(null);
  const [assistantChats, setAssistantChats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const API_BASE_URL = 'http://localhost:8082';

  // Initialize clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (activeSection === 'assistants') {
      fetchAssistants();
    }
  }, [activeSection]);

  // API Functions
  const initializeUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
      });
      const data = await response.json();
      setUserId(data.userId);
      localStorage.setItem('userId', data.userId);
      setIsAuthenticated(true);
      setActiveSection('assistants');
      await fetchAssistants();
    } catch (error) {
      setError('Failed to initialize user session');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/assistants`);
      const data = await response.json();
      setAssistants(data);
    } catch (error) {
      setError('Failed to fetch assistants');
      console.error('Fetch assistants error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async (assistantId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/assistants/${assistantId}/chats`,
        {
          headers: { 'User-Id': userId },
        }
      );
      const data = await response.json();
      setAssistantChats((prev) => ({ ...prev, [assistantId]: data }));
    } catch (error) {
      setError('Failed to fetch chats');
      console.error('Fetch chats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async (assistantId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/assistants/${assistantId}/chats`,
        {
          method: 'POST',
          headers: { 'User-Id': userId },
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

  const handleLogin = () => {
    initializeUser();
  };

  // Chat Interface Component
  const ChatInterface = ({ chatId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/chats/${chatId}/messages`,
            {
              headers: { 'User-Id': userId },
            }
          );
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };

      if (chatId) {
        fetchMessages();
      }
    }, [chatId]);

    const handleSend = async () => {
      if (!newMessage.trim()) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chats/${chatId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Id': userId,
            },
            body: JSON.stringify({ content: newMessage }),
          }
        );
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    };

    return (
      <div className='flex flex-col h-[600px]'>
        <div className='flex-grow overflow-y-auto bg-[#fffff0] border-2 border-gray-400 p-4'>
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
              <div className='mt-1'>{message.content}</div>
            </div>
          ))}
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

  // Assistant List Component
  const AssistantList = ({ onSectionChange }) => {
    useEffect(() => {
      // fetchAssistants();
    }, []);

    const handleAssistantClick = async (assistantId) => {
      setExpandedAssistant(assistantId);
      await fetchChats(assistantId);
    };

    return (
      <div className='space-y-2'>
        {/* Create New Assistant Button */}
        <div className='border-2 border-gray-400 bg-[#f0f0f0]'>
          <button
            onClick={() => handleSectionChange('create')}
            className='w-full p-2 text-left font-mono text-sm bg-green-700 text-white hover:bg-green-800 flex items-center'>
            <Plus className='h-4 w-4 mr-2' /> REQUEST NEW AGENT
          </button>
        </div>

        {/* Existing Assistants List */}
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            className='border-2 border-gray-400 bg-[#f0f0f0]'>
            <button
              onClick={() => handleAssistantClick(assistant.id)}
              className='w-full p-2 text-left font-mono text-sm bg-blue-900 text-white hover:bg-blue-800'>
              ► {assistant.name}
            </button>
            {expandedAssistant === assistant.id && (
              <div className='p-2 space-y-2'>
                {assistantChats[assistant.id]?.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-2 text-left font-mono text-xs border hover:bg-yellow-100
                              ${
                                selectedChat === chat.id
                                  ? 'bg-yellow-200 border-black'
                                  : 'border-gray-300'
                              }`}>
                    SESSION: {chat.id.slice(-8)}
                    <br />
                    STARTED: {new Date(chat.createdAt).toLocaleString()}
                  </button>
                ))}
                <button
                  onClick={() => createNewChat(assistant.id)}
                  className='w-full p-2 bg-green-700 text-white font-mono text-sm border-2 border-black
                           hover:bg-green-800'>
                  + NEW SESSION
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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
              <div>SYSTEM TIME: {currentTime.toLocaleTimeString()}</div>
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

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className='w-full bg-gradient-to-b from-green-700 to-green-800 text-white p-3 
                           font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[1px] hover:translate-y-[1px]
                           active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                           disabled:opacity-50'>
                  {loading
                    ? '【 AUTHENTICATING... 】'
                    : '【 PROCEED TO SECURE LOGIN 】'}
                </button>

                {error && (
                  <div className='text-red-700 text-sm text-center border-t border-red-300 pt-4'>
                    SYSTEM ERROR: {error}
                  </div>
                )}

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
                    <AssistantList onSectionChange={handleSectionChange} />
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
                            DESIGNATION:
                          </span>
                          <input
                            type='text'
                            className='w-full mt-1 p-2 font-mono border-2 border-gray-400 bg-[#fffff0]'
                            placeholder='ENTER AGENT DESIGNATION'
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
                            <input type='file' className='font-mono text-sm' />
                          </div>
                        </label>

                        <div className='pt-4 space-x-2'>
                          <button
                            className="bg-green-700 text-white px-4 py-2 font-['Courier_New'] text-sm
                                   border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                                   hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                   hover:translate-x-[1px] hover:translate-y-[1px]">
                            SUBMIT REQUEST
                          </button>
                          <button
                            className="bg-gray-200 px-4 py-2 font-['Courier_New'] text-sm
                                   border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                                   hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                   hover:translate-x-[1px] hover:translate-y-[1px]">
                            CLEAR FORM
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat Interface */}
                  {selectedChat && <ChatInterface chatId={selectedChat} />}
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
    </div>
  );
};

export default GovAssistantPortal;
