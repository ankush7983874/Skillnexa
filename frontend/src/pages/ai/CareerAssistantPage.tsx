import React, { useEffect, useRef, useState } from 'react';
import { aiService } from '../../services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  isError?: boolean;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Parse lines to render markdown headings, code blocks, tables, lists, and bold text
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const body = tableRows.slice(1).filter(r => !r.every(cell => cell.trim().startsWith('---') || cell.trim().startsWith(':---')));

    elements.push(
      <div key={key} className="my-3 overflow-x-auto rounded-lg border border-violet-900 border-opacity-40">
        <table className="w-full text-xs text-left text-slate-300 border-collapse">
          <thead className="bg-violet-950 bg-opacity-60 text-violet-300 font-semibold border-b border-violet-900 border-opacity-40">
            <tr>
              {header.map((col, idx) => (
                <th key={idx} className="px-3 py-2 border-r border-violet-900 border-opacity-30 last:border-0">
                  {col.trim().replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-violet-900 border-opacity-20 hover:bg-violet-950 hover:bg-opacity-20">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 border-r border-violet-900 border-opacity-20 last:border-0">
                    {parseInlineMarkdown(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle inline code `code` and bold **bold**
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="bg-violet-950 bg-opacity-60 text-violet-300 font-mono px-1.5 py-0.5 rounded text-xs border border-violet-800 border-opacity-30">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="text-slate-200 italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const key = `line-${index}`;

    // Code block check
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={key} className="my-3 rounded-xl overflow-hidden border border-violet-900 border-opacity-50 bg-[#0d0d1a]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-violet-950 bg-opacity-60 border-b border-violet-900 border-opacity-40 text-xs text-violet-300 font-mono">
              <span>{codeLang || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeBuffer.join('\n'))}
                className="hover:text-white transition-colors text-[10px] bg-violet-900 bg-opacity-40 px-2 py-0.5 rounded"
              >
                Copy Code
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start code block
        if (inTable) flushTable(`table-${index}`);
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Table check
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(`table-${index}`);
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key} className="text-lg font-bold text-white mt-3 mb-2">{parseInlineMarkdown(line.slice(2))}</h1>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key} className="text-base font-bold text-violet-300 mt-3 mb-1.5">{parseInlineMarkdown(line.slice(3))}</h2>);
      return;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key} className="text-sm font-semibold text-violet-400 mt-2.5 mb-1">{parseInlineMarkdown(line.slice(4))}</h3>);
      return;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      elements.push(<hr key={key} className="my-3 border-violet-900 border-opacity-30" />);
      return;
    }

    // Bullet lists
    if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listContent = line.trim().slice(2);
      elements.push(
        <div key={key} className="flex items-start gap-2 text-xs text-slate-300 my-0.5 pl-2">
          <span className="text-violet-400 shrink-0 mt-0.5">•</span>
          <span>{parseInlineMarkdown(listContent)}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={key} className="flex items-start gap-2 text-xs text-slate-300 my-0.5 pl-2">
          <span className="text-violet-400 font-bold shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span>{parseInlineMarkdown(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={key} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={key} className="text-xs text-slate-300 my-1 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  if (inTable) flushTable('table-end');

  return <div className="space-y-0.5">{elements}</div>;
};

const GREETING = `# 👋 Welcome to SkillNexa Technical & Career AI!

I am your general-purpose **Technical, Coding, DSA, and Career Assistant**. Ask me anything!

### **What I Can Answer:**
• **DSA Roadmaps & Algorithms**: *"Give me roadmap of DSA"*, *"What is binary search?"*, *"Explain time complexity"*
• **Programming & Code**: *"Give me bubble sort in C"*, *"Give quick sort in Java"*, *"Write binary search in Python"*
• **Computer Science Core**: *"Explain polymorphism in Java"*, *"What is DBMS normalization?"*, *"Explain OSI model"*
• **Career & Role Roadmaps**: *"Frontend developer roadmap"*, *"3-month placement preparation plan"*
• **Interview Prep & Practice**: *"Give me Java interview questions"*, *"Give me DSA practice questions"*
• **SkillNexa Profile Guidance**: *"Which career is suitable for my profile?"*, *"How can I improve my resume?"*`;

const QUICK_PROMPTS = [
  'Give me roadmap of DSA',
  'What is binary search?',
  'Give me Java interview questions',
  'How can I improve my Java skills?',
  'Roadmap for frontend developer',
  '3-month placement preparation plan',
];

const CareerAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendQuery = async (queryText: string) => {
    const msg = queryText.trim();
    if (!msg || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await aiService.chatWithAssistant(msg, history);
      const data = (res.data as any).data ?? res.data;
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || data.answer || 'I could not generate a response. Please try again.',
          intent: data.intent,
        },
      ]);
    } catch (e: any) {
      const errMsg = e.response?.data?.message || 'AI service is temporarily unavailable. Please try again.';
      setError(errMsg);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠ ' + errMsg,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: GREETING }]);
    setError('');
  };

  return (
    <div className="ai-fade-in flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge">AI Assistant</span>
            <span className="ai-badge-green">General Technical + Career AI</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Career & Technical AI Assistant</h1>
        </div>
        <button
          onClick={clearChat}
          className="ai-button-secondary px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
        >
          🗑 Clear Chat
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} ai-fade-in`}>
            {m.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-full shrink-0 mr-3 mt-0.5 flex items-center justify-center text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                ⬡
              </div>
            )}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-sm text-white'
                  : m.isError
                  ? 'ai-card-static rounded-bl-sm border-red-900 bg-red-950 bg-opacity-20 text-red-300'
                  : 'ai-card-static rounded-bl-sm text-slate-300'
              }`}
              style={m.role === 'user' ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : {}}
            >
              {m.role === 'assistant' ? <MarkdownRenderer content={m.content} /> : m.content}
              {m.intent && m.intent !== 'GENERAL_TECHNICAL' && (
                <div className="mt-2 pt-2 border-t border-violet-900 border-opacity-30 flex items-center gap-2">
                  <span className="ai-badge text-[10px]">{m.intent.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start ai-fade-in">
            <div
              className="w-8 h-8 rounded-full shrink-0 mr-3 mt-0.5 flex items-center justify-center text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              ⬡
            </div>
            <div className="ai-card-static px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-2 text-xs text-violet-300">
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map(d => (
                    <div
                      key={d}
                      className="w-2 h-2 rounded-full bg-violet-400 ai-pulse"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
                <span className="ml-1 text-slate-400 font-medium">Analyzing question & generating technical response…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => sendQuery(prompt)}
            disabled={loading}
            className="ai-button-secondary px-3 py-1.5 rounded-full text-xs font-medium hover:border-violet-500 transition-colors"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="ai-card-static p-2.5 rounded-2xl flex items-end gap-2 shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any DSA, programming, CS topic, or career question... (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 resize-none px-2 py-1"
        />
        <button
          onClick={() => sendQuery(input)}
          disabled={loading || !input.trim()}
          className="ai-button px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
        >
          {loading ? 'Thinking…' : 'Send →'}
        </button>
      </div>

      {error && (
        <div className="mt-2 flex items-center justify-between text-xs text-red-400 bg-red-950 bg-opacity-30 border border-red-900 border-opacity-40 p-2 rounded-lg shrink-0">
          <span>{error}</span>
          <button onClick={() => sendQuery(messages[messages.length - 1]?.content || '')} className="underline font-semibold ml-2">
            Retry
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-500 mt-2 text-center shrink-0">
        SkillNexa AI Assistant answers DSA, CS fundamentals, programming, and profile-based career queries.
      </p>
    </div>
  );
};

export default CareerAssistantPage;
