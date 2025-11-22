'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import type { User, ResearcherCredits, ChatMessage } from '@/types';

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<ResearcherCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    // Check auth session from localStorage
    const session = getAuthSession();

    if (!session || session.role !== 'researcher') {
      router.push('/login');
      return;
    }

    const supabase = createClient();

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (!userData || userData.role !== 'researcher') {
      router.push('/login');
      return;
    }

    setUser(userData as User);

    const { data: creditsData } = await supabase
      .from('researcher_credits')
      .select('*')
      .eq('researcher_id', userData.id)
      .single();

    setCredits(creditsData as ResearcherCredits);

    // Add initial AI message
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your medical research assistant specialized in hormonal data. What type of study are you working on?'
    }]);

    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (data.response) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
        };

        setMessages(prev => [...prev, aiMessage]);
        setShowGenerateButton(data.offerReport);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!user || !credits) return;

    if (credits.biochain_balance < 1) {
      alert('You don\'t have enough BIOCHAIN credits. You need at least 1 credit.');
      router.push('/researcher-credits');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researcherId: user.id,
          messages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        const successMessage: ChatMessage = {
          role: 'assistant',
          content: `Report generated successfully! 1 BIOCHAIN has been deducted from your balance. You can view the report in your Reports section. The report includes data from ${data.report.report_data.total_samples} anonymized samples.`,
        };

        setMessages(prev => [...prev, successMessage]);
        setShowGenerateButton(false);

        // Update credits
        setCredits(prev => prev ? { ...prev, biochain_balance: prev.biochain_balance - 1 } : null);

        // Redirect to reports after 3 seconds
        setTimeout(() => {
          router.push('/researcher-reports');
        }, 3000);
      } else {
        throw new Error(data.error || 'Error generating report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(error.message || 'Error generating report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <MainLayout userRole="researcher" userName={user.email}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Chat
            </h1>
            <p className="text-gray-600">
              Define your research criteria with the help of our AI
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">BIOCHAIN Balance</p>
            <Badge className="text-lg px-4 py-2">
              💎 {credits?.biochain_balance || 0}
            </Badge>
          </div>
        </div>

        {credits && credits.biochain_balance < 1 && (
          <Alert className="mb-6 bg-orange-50 border-orange-200">
            <AlertDescription className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold mb-1">Insufficient Credits</h3>
                <p className="text-sm mb-3">
                  You need at least 1 BIOCHAIN to generate a report. Purchase more credits to continue.
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push('/researcher-credits')}
                >
                  Buy Credits
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-600">AI is typing...</p>
                  </div>
                </div>
              </div>
            )}

            {generating && (
              <div className="flex justify-start">
                <div className="bg-violet-100 border border-violet-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-sm text-violet-700">Generating report...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Generate Report Button */}
          {showGenerateButton && !generating && (
            <div className="px-6 py-4 border-t border-gray-200 bg-violet-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Ready to generate your report?</p>
                  <p className="text-sm text-gray-600">
                    Cost: 1 BIOCHAIN • $30 USDC will be distributed among contributors
                  </p>
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={!credits || credits.biochain_balance < 1}
                  className="bg-accent hover:bg-accent/90"
                >
                  Generate Report
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your research criteria..."
                disabled={sending || generating}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending || generating}
              >
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • AI will help you define exactly what data you need
            </p>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-violet-50 to-white">
          <h3 className="text-lg font-semibold mb-4">Tips for Better Results</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Be specific about the age range you need</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Mention whether you're interested in women using hormonal contraceptives or not</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Specify which hormones are relevant for your study</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Indicate if you need data on specific conditions (PCOS, endometriosis, etc.)</span>
            </li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}
