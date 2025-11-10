

import React, { useState, useCallback } from 'react';
import { AnalysisType, FeedbackStatus } from './types';
import { solveProblem, extractTextFromImage, learnFromMistake } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { BrainCircuitIcon } from './components/icons';

// A simple component to get the API key from the user
const ApiKeySetup: React.FC<{ onApiKeySubmit: (key: string) => void }> = ({ onApiKeySubmit }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onApiKeySubmit(key.trim());
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="p-8 bg-panel border border-border rounded-lg shadow-md max-w-md w-full text-center">
                <BrainCircuitIcon className="w-12 h-12 text-accent mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-accent mb-2">API Key Required</h1>
                <p className="text-muted mb-6">
                    Please provide your Google AI Studio API key to continue.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full bg-background border border-border rounded-md p-3 font-mono text-sm text-primary placeholder-muted focus:ring-2 focus:ring-accent focus:border-accent transition-colors duration-200"
                        placeholder="Enter your API key..."
                    />
                    <p className="text-xs text-muted mt-2 text-left">
                        You can get a key from{' '}
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline hover:text-accent-hover"
                        >
                            Google AI Studio
                        </a>.
                    </p>
                    <button
                        type="submit"
                        disabled={!key.trim()}
                        className="mt-6 w-full bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover transition-colors duration-200 disabled:bg-border disabled:cursor-not-allowed"
                    >
                        Save & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  // Try to get the key from env, but allow user to set it manually.
  const [apiKey, setApiKey] = useState<string | null>(process.env.API_KEY || null);

  const [problem, setProblem] = useState<string>('');
  const [constraints, setConstraints] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('Python');
  const [analysisType, setAnalysisType] = useState<AnalysisType>(AnalysisType.SUGGEST);
  
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [image, setImage] = useState<{ file: File, dataUrl: string } | null>(null);
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);

  // State for feedback loop
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>('pending');
  const [correctCode, setCorrectCode] = useState<string>('');
  const [isLearning, setIsLearning] = useState<boolean>(false);
  const [learningAnalysis, setLearningAnalysis] = useState<string>('');

  const resetFeedbackState = () => {
    setFeedbackStatus('pending');
    setCorrectCode('');
    setLearningAnalysis('');
  };

  const handleImageExtract = useCallback(async () => {
    if (!image || !apiKey) return;

    setIsExtractingText(true);
    setError(null);

    try {
        const base64Image = image.dataUrl.split(',')[1];
        if (!base64Image) {
            throw new Error('Invalid image data.');
        }
        const mimeType = image.file.type;
        const extractedText = await extractTextFromImage(apiKey, base64Image, mimeType);
        setProblem(prev => prev ? `${prev}\n\n--- From Image ---\n${extractedText}` : extractedText);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while extracting text.';
        setError(errorMessage);
    } finally {
        setIsExtractingText(false);
        setImage(null); // Clear image after extraction is complete
    }
  }, [image, apiKey]);

  const handleSubmit = useCallback(async () => {
    if (!apiKey) {
      setError('API Key is not set.');
      return;
    }
    if (!problem.trim()) {
      setError('Problem description cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput('');
    resetFeedbackState();

    try {
      const result = await solveProblem(apiKey, problem, constraints, code, language, analysisType);
      setOutput(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, problem, constraints, code, language, analysisType]);

  const handleFeedbackSubmit = useCallback(async () => {
    if (!apiKey || !output || !correctCode.trim()) return;
    
    setIsLearning(true);
    setError(null);
    setLearningAnalysis('');
    
    try {
      // Extract the incorrect code from the original output
      const incorrectCodeMatch = output.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const incorrectCode = incorrectCodeMatch ? incorrectCodeMatch[1] : '';

      const analysis = await learnFromMistake(apiKey, problem, constraints, language, incorrectCode, correctCode);
      setLearningAnalysis(analysis);
      setFeedbackStatus('complete');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred during the learning process.';
      setError(errorMessage);
    } finally {
      setIsLearning(false);
    }
  }, [apiKey, problem, constraints, language, output, correctCode]);
  
  // If no API key, render the setup screen
  if (!apiKey) {
      return <ApiKeySetup onApiKeySubmit={setApiKey} />;
  }

  return (
    <div className="h-screen bg-background text-secondary font-sans">
      <main className="h-full flex flex-col">
        <header className="px-4 md:px-8 pt-4 md:pt-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BrainCircuitIcon className="w-10 h-10 text-[#fbbf24]" />
              <h1 className="text-3xl md:text-4xl font-bold text-accent tracking-tight">
                AI Grandmaster
              </h1>
            </div>
          </div>
           <p className="mt-2 text-muted max-w-2xl">
            Input a problem, add your code, and let a Legendary Grandmaster AI guide you to the optimal solution.
          </p>
        </header>

        <div className="flex-1 flex flex-row gap-8 p-4 md:p-8 overflow-hidden">
          <div className="w-full max-w-[500px] shrink-0">
            <InputSection 
              problem={problem}
              setProblem={setProblem}
              constraints={constraints}
              setConstraints={setConstraints}
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              analysisType={analysisType}
              setAnalysisType={setAnalysisType}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              image={image}
              setImage={setImage}
              handleImageExtract={handleImageExtract}
              isExtractingText={isExtractingText}
            />
          </div>
          <div className="flex-1 min-w-0">
            <OutputSection
              output={output}
              isLoading={isLoading}
              error={error}
              feedbackStatus={feedbackStatus}
              setFeedbackStatus={setFeedbackStatus}
              correctCode={correctCode}
              setCorrectCode={setCorrectCode}
              onFeedbackSubmit={handleFeedbackSubmit}
              isLearning={isLearning}
              learningAnalysis={learningAnalysis}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
