
import React, { useState, useCallback } from 'react';
import { AnalysisType } from './types';
import { solveProblem, extractTextFromImage } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { BrainCircuitIcon } from './components/icons';

const App: React.FC = () => {
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

  const handleImageExtract = useCallback(async () => {
    if (!image) return;

    setIsExtractingText(true);
    setError(null);

    try {
        const base64Image = image.dataUrl.split(',')[1];
        if (!base64Image) {
            throw new Error('Invalid image data.');
        }
        const mimeType = image.file.type;
        const extractedText = await extractTextFromImage(base64Image, mimeType);
        setProblem(prev => prev ? `${prev}\n\n--- From Image ---\n${extractedText}` : extractedText);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while extracting text.';
        setError(errorMessage);
    } finally {
        setIsExtractingText(false);
        setImage(null); // Clear image after extraction is complete
    }
  }, [image]);

  const handleSubmit = useCallback(async () => {
    if (!problem.trim()) {
      setError('Problem description cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      const result = await solveProblem(problem, constraints, code, language, analysisType);
      setOutput(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [problem, constraints, code, language, analysisType]);

  return (
    <div className="min-h-screen bg-background text-secondary font-sans">
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BrainCircuitIcon className="w-10 h-10 text-accent" />
              <h1 className="text-3xl md:text-4xl font-bold text-accent tracking-tight">
                AI Grandmaster
              </h1>
            </div>
          </div>
           <p className="mt-2 text-muted max-w-2xl">
            Input a problem, add your code, and let a 300 IQ AI guide you to the optimal solution.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
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
          <OutputSection
            output={output}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
