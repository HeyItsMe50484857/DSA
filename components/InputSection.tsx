import React from 'react';
import { AnalysisType } from '../types';
import { LANGUAGES, ANALYSIS_OPTIONS } from '../constants';
import { WandSparklesIcon, ImageIcon, XIcon } from './icons';

interface InputSectionProps {
    problem: string;
    setProblem: (value: string) => void;
    constraints: string;
    setConstraints: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
    analysisType: AnalysisType;
    setAnalysisType: (value: AnalysisType) => void;
    handleSubmit: () => void;
    isLoading: boolean;
    image: { file: File; dataUrl: string } | null;
    setImage: (image: { file: File; dataUrl: string } | null) => void;
    handleImageExtract: () => void;
    isExtractingText: boolean;
}

const commonTextareaClasses = "w-full bg-panel border border-border rounded-md p-3 font-mono text-sm text-primary placeholder-muted focus:ring-2 focus:ring-accent focus:border-accent transition-colors duration-200";

export const InputSection: React.FC<InputSectionProps> = ({
    problem, setProblem, constraints, setConstraints, code, setCode, language, setLanguage,
    analysisType, setAnalysisType, handleSubmit, isLoading,
    image, setImage, handleImageExtract, isExtractingText,
}) => {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage({ file, dataUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-panel border border-border rounded-lg shadow-sm">
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <label htmlFor="problem" className="block text-sm font-medium text-accent">Problem Description</label>
                    <label htmlFor="image-upload" className="text-sm font-medium text-accent hover:text-accent-hover cursor-pointer flex items-center gap-1 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload Image</span>
                        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
                <textarea
                    id="problem"
                    rows={8}
                    className={commonTextareaClasses}
                    placeholder="e.g., Given an array of integers, find the two numbers that add up to a specific target..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                />

                {image && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-accent mb-2">Image Preview</p>
                        <div className="relative w-full border border-border rounded-md p-2 bg-background">
                            <img src={image.dataUrl} alt="Problem preview" className="max-h-48 w-auto rounded" />
                            <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-white/50 hover:bg-white rounded-full p-0.5" aria-label="Remove image">
                                <XIcon className="w-4 h-4 text-primary" />
                            </button>
                        </div>
                        <button
                            onClick={handleImageExtract}
                            disabled={isExtractingText}
                            className="flex items-center justify-center gap-2 w-full mt-2 bg-accent/10 text-accent font-bold py-2 px-4 rounded-md hover:bg-accent/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExtractingText ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    <span>Extracting...</span>
                                </>
                            ) : (
                                <span>Extract Text from Image</span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="constraints" className="block text-sm font-medium text-accent mb-2">Problem Constraints (Optional)</label>
                <textarea
                    id="constraints"
                    rows={3}
                    className={commonTextareaClasses}
                    placeholder="e.g., 1 <= N <= 10^5, 0 <= arr[i] <= 10^9"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="code" className="block text-sm font-medium text-accent mb-2">Your Code (Optional)</label>
                <textarea
                    id="code"
                    rows={10}
                    className={commonTextareaClasses}
                    placeholder="Paste your code attempt here."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="language" className="block text-sm font-medium text-accent mb-2">Language</label>
                <select
                    id="language"
                    className="w-full bg-panel border border-border rounded-md p-2.5 text-sm text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-colors duration-200"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
            </div>
            
            <div>
                <h3 className="text-sm font-medium text-accent mb-3">Analysis Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ANALYSIS_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setAnalysisType(option.value)}
                            className={`p-3 text-left rounded-md border text-sm transition-all duration-200 ${
                                analysisType === option.value 
                                ? 'bg-accent/10 border-accent/30 ring-2 ring-accent' 
                                : 'bg-panel border-border hover:bg-background'
                            }`}
                        >
                            <p className="font-semibold text-primary">{option.label}</p>
                            <p className="text-xs text-muted mt-1">{option.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-accent-hover transition-colors duration-200 disabled:bg-border disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <WandSparklesIcon className="w-5 h-5" />
                        <span>Analyze Solution</span>
                    </>
                )}
            </button>
        </div>
    );
};