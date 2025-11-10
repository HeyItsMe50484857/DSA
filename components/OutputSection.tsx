import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuitIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon, ClipboardIcon } from './icons';
import { FeedbackStatus } from '../types';

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
                className="absolute top-3 right-3 px-3 py-1 text-xs rounded-md bg-yellow-400 hover:bg-yellow-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Copy code to clipboard"
            >
                {copied ? (
                    <span className="flex items-center gap-1 font-semibold text-green-800">
                        <CheckIcon className="w-4 h-4" />
                        COPIED
                    </span>
                ) : (
                    <span className="font-bold" style={{ color: '#d946ef', textShadow: '0 0 5px #d946ef' }}>
                        COPY
                    </span>
                )}
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

interface FeedbackSectionProps {
    status: FeedbackStatus;
    setStatus: (status: FeedbackStatus) => void;
    correctCode: string;
    setCorrectCode: (code: string) => void;
    onSubmit: () => void;
    isLearning: boolean;
    learningAnalysis: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
    status, setStatus, correctCode, setCorrectCode, onSubmit, isLearning, learningAnalysis
}) => {
    if (status === 'complete') {
        if (isLearning) {
            return (
                <div className="mt-6 p-4 border-t border-border flex items-center justify-center text-muted">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Analyzing mistake...</span>
                </div>
            )
        }
        return (
            <div className="mt-6 pt-4 border-t border-border">
                 <h3 className="text-lg font-semibold text-accent mb-4">Corrective Analysis</h3>
                 <SimpleMarkdownRenderer content={learningAnalysis} />
            </div>
        )
    }

    if (status === 'correct') {
        return (
            <div className="mt-6 p-4 border-t border-border text-center text-muted">
                <p>Great! Thanks for the feedback.</p>
            </div>
        );
    }
    
    if (status === 'incorrect') {
        return (
            <div className="mt-6 pt-4 border-t border-border">
                <label htmlFor="correct-code" className="block text-sm font-medium text-accent mb-2">Provide the Accepted Code</label>
                <textarea
                    id="correct-code"
                    rows={8}
                    className="w-full bg-background border border-border rounded-md p-3 font-mono text-sm text-primary placeholder-muted focus:ring-2 focus:ring-accent focus:border-accent transition-colors duration-200"
                    placeholder="Paste the code that was accepted here."
                    value={correctCode}
                    onChange={(e) => setCorrectCode(e.target.value)}
                />
                <button
                    onClick={onSubmit}
                    disabled={isLearning || !correctCode.trim()}
                    className="flex items-center justify-center gap-2 w-full mt-2 bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLearning ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Learning...</span>
                        </>
                    ) : (
                        <span>Submit for Analysis</span>
                    )}
                </button>
            </div>
        )
    }

    return (
        <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm font-medium text-muted mb-3">Was this solution correct?</p>
            <div className="flex justify-center gap-4">
                <button 
                    onClick={() => setStatus('correct')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                >
                    <ThumbsUpIcon className="w-4 h-4" />
                    Yes
                </button>
                <button 
                    onClick={() => setStatus('incorrect')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                    <ThumbsDownIcon className="w-4 h-4" />
                    No
                </button>
            </div>
        </div>
    );
}


interface OutputSectionProps {
    output: string;
    isLoading: boolean;
    error: string | null;
    feedbackStatus: FeedbackStatus;
    setFeedbackStatus: (status: FeedbackStatus) => void;
    correctCode: string;
    setCorrectCode: (code: string) => void;
    onFeedbackSubmit: () => void;
    isLearning: boolean;
    learningAnalysis: string;
}

export const OutputSection: React.FC<OutputSectionProps> = (props) => {
    const { output, isLoading, error, feedbackStatus, setFeedbackStatus, correctCode, setCorrectCode, onFeedbackSubmit, isLearning, learningAnalysis } = props;

    const renderContent = () => {
        if (isLoading) return <LoadingState />;
        if (error) return <div className="text-danger p-4 bg-danger-bg rounded-md border border-danger-border">{error}</div>;
        if (output) return <SimpleMarkdownRenderer content={output} />;
        return <InitialState />;
    };
    
    return (
        <div className="h-full relative bg-panel border border-border rounded-lg p-6 shadow-sm flex flex-col overflow-y-auto">
            <div className="flex-grow">
                {renderContent()}
            </div>
            {!isLoading && !error && output && (
                <FeedbackSection 
                    status={feedbackStatus}
                    setStatus={setFeedbackStatus}
                    correctCode={correctCode}
                    setCorrectCode={setCorrectCode}
                    onSubmit={onFeedbackSubmit}
                    isLearning={isLearning}
                    learningAnalysis={learningAnalysis}
                />
            )}
        </div>
    );
};