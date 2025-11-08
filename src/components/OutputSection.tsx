import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuitIcon, ClipboardIcon, CheckIcon } from './icons';

declare global {
    interface Window {
        hljs: any;
    }
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current && window.hljs) {
            window.hljs.highlightElement(codeRef.current);
        }
    }, [code]);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-border p-2 rounded-md hover:brightness-95 transition-all duration-200 opacity-0 group-hover:opacity-100 text-accent-hover focus:opacity-100"
                aria-label="Copy code to clipboard"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-accent" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
            <pre className="bg-background p-4 rounded-md overflow-x-auto text-primary">
                <code ref={codeRef} className={`language-${language.toLowerCase()} font-mono`}>{code}</code>
            </pre>
        </div>
    );
};


// Simple Markdown-like parser since react-markdown is not available
// This is a simplified renderer and won't cover all markdown features.
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(```[\s\S]*?```|## .*|# .*|\* .*)/g);

    return (
        <div className="prose prose-sm md:prose-base max-w-none text-secondary">
            {parts.map((part, index) => {
                if (part.startsWith('```')) {
                    const codeBlock = part.replace(/```/g, '');
                    const lang = codeBlock.split('\n')[0].trim();
                    const code = codeBlock.substring(lang.length).trim();
                    return <CodeBlock key={index} language={lang || 'plaintext'} code={code} />;
                }
                if (part.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-accent">{part.substring(3)}</h2>;
                }
                if (part.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-3 text-accent">{part.substring(2)}</h1>;
                }
                if (part.startsWith('* ')) {
                     return <li key={index} className="ml-5 list-disc">{part.substring(2)}</li>;
                }
                // Handle paragraphs with bold text **text**
                const paragraphParts = part.split(/(\*\*[\s\S]*?\*\*)/g);

                return (
                    <p key={index} className="mb-4">
                        {paragraphParts.map((pPart, pIndex) => {
                            if (pPart.startsWith('**') && pPart.endsWith('**')) {
                                return <strong key={pIndex} className="text-primary">{pPart.slice(2, -2)}</strong>;
                            }
                            return <span key={pIndex}>{pPart}</span>;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

const LoadingState: React.FC = () => {
  const messages = [
    "Analyzing complexity...",
    "Searching for optimal substructure...",
    "Compiling thoughts...",
    "Debugging the matrix...",
    "Evaluating algorithms...",
  ];
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 2000);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <BrainCircuitIcon className="w-16 h-16 text-accent animate-pulse-fast" />
      <p className="mt-4 text-lg font-semibold text-accent">{message}</p>
      <p className="text-muted">The AI is working on your problem.</p>
    </div>
  );
};

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <BrainCircuitIcon className="w-16 h-16 text-border" />
        <p className="mt-4 text-lg font-semibold text-muted">Awaiting Analysis</p>
        <p className="text-muted">Your solution will appear here.</p>
    </div>
);


interface OutputSectionProps {
    output: string;
    isLoading: boolean;
    error: string | null;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ output, isLoading, error }) => {
    const renderContent = () => {
        if (isLoading) return <LoadingState />;
        if (error) return <div className="text-danger p-4 bg-danger-bg rounded-md border border-danger-border">{error}</div>;
        if (output) return <SimpleMarkdownRenderer content={output} />;
        return <InitialState />;
    };
    
    return (
        <div className="relative bg-panel border border-border rounded-lg p-6 lg:h-full min-h-[500px] shadow-sm">
            {renderContent()}
        </div>
    );
};