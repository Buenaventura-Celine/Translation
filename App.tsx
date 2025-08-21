import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { IcuInput } from './components/IcuInput';
import { TranslateButton } from './components/TranslateButton';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { translateIcuStrings, ServiceTranslationResult } from './services/geminiService';
import { LANGUAGES_FOR_CODE_INPUT, LANGUAGES_FOR_TEXT_INPUT } from './constants';
import { CodeBracketIcon, DocumentTextIcon, InformationCircleIcon } from './components/icons';

// --- TYPES ---
export type InputType = 'arb' | 'js' | 'text';
export type Arrangement = 'mobile' | 'web_v1' | 'web_v2' | 'custom';
export interface TranslationResult {
  id?: string;
  original: string;
  translations: Record<string, string>;
}
interface ParsedString {
    id?: string;
    original: string;
}

// --- PARSERS ---
const parseArb = (content: string): ParsedString[] => {
    let processedContent = content.trim();

    // Heuristic: If it doesn't look like a JSON object but contains quotes and colons,
    // it's likely a fragment. Let's try to fix it.
    if (!processedContent.startsWith('{') && processedContent.includes(':')) {
        // Remove trailing comma if it exists, which is a common copy-paste error
        if (processedContent.endsWith(',')) {
            processedContent = processedContent.slice(0, -1);
        }
        // Wrap in curly braces to form a valid JSON object
        processedContent = `{${processedContent}}`;
    }

    try {
        const arb = JSON.parse(processedContent);
        const results: ParsedString[] = [];
        for (const key in arb) {
            // Filter out ARB metadata keys which start with '@'
            if (Object.prototype.hasOwnProperty.call(arb, key) && !key.startsWith('@')) {
                results.push({ id: key, original: arb[key] });
            }
        }
        return results;
    } catch (e) {
        // If parsing still fails, the original error message is still appropriate.
        throw new Error("Invalid ARB (JSON) format. Please check your input, even after automatic formatting.");
    }
};


const parseJs = (content: string): ParsedString[] => {
    const results: ParsedString[] = [];
    // This regex captures the key and the defaultMessage value from a JS object.
    const blockRegex = /([\w\d_]+)\s*:\s*\{[\s\S]*?defaultMessage:\s*['"]((?:[^'\\]|\\.)*)['"][\s\S]*?\}/g;
    let match;
    while ((match = blockRegex.exec(content)) !== null) {
        results.push({ id: match[1], original: match[2] });
    }
    if (results.length === 0) {
       throw new Error("Could not find any valid JS/TS message objects. Ensure they follow the format: `key: { defaultMessage: '...' }`.");
    }
    return results;
};

const parseText = (content: string): ParsedString[] => {
    return content.split('\n')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(s => ({ original: s }));
};

// --- UI SUB-COMPONENTS ---

const OptionCard: React.FC<{ title: string; description: string; selected: boolean; onClick: () => void; icon: React.ReactNode; }> = ({ title, description, selected, onClick, icon }) => (
    <div
        onClick={onClick}
        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-slate-200 hover:border-slate-400'}`}
    >
        <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-md">{icon}</div>
            <div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
  const [inputContent, setInputContent] = useState<string>('');
  const [inputType, setInputType] = useState<InputType>('text');
  const [arrangement, setArrangement] = useState<Arrangement>('mobile');
  const [customLanguages, setCustomLanguages] = useState('ja, ko, zh-CN');

  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const arrangementOptions = useMemo(() => {
    switch (inputType) {
        case 'arb': return ['mobile', 'custom'];
        case 'js': return ['web_v1', 'web_v2', 'custom'];
        case 'text': return ['mobile', 'web_v1', 'web_v2', 'custom'];
        default: return [];
    }
  }, [inputType]);

  // Reset arrangement if it becomes invalid after inputType change
  React.useEffect(() => {
    if (!arrangementOptions.includes(arrangement)) {
        setArrangement(arrangementOptions[0] as Arrangement);
    }
  }, [inputType, arrangement, arrangementOptions]);
  
  const currentLanguages = useMemo(() => {
    if (arrangement === 'custom') {
        return customLanguages.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (inputType === 'text') {
        return LANGUAGES_FOR_TEXT_INPUT;
    }
    return LANGUAGES_FOR_CODE_INPUT;
  }, [arrangement, customLanguages, inputType]);


  const handleTranslate = useCallback(async () => {
    if (inputContent.trim() === '') {
      setError('Please enter some content to translate.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
        let parsedStrings: ParsedString[] = [];
        if (inputType === 'arb') parsedStrings = parseArb(inputContent);
        else if (inputType === 'js') parsedStrings = parseJs(inputContent);
        else parsedStrings = parseText(inputContent);

        if (parsedStrings.length === 0) {
            setError('No strings found to translate. Please check your input.');
            setIsLoading(false);
            return;
        }

        if(currentLanguages.length === 0) {
            setError('Please define at least one custom language or select a preset arrangement.');
            setIsLoading(false);
            return;
        }

        const stringsToTranslate = parsedStrings.map(p => p.original);
        const translationResults: ServiceTranslationResult[] = await translateIcuStrings(stringsToTranslate, currentLanguages);

        // Stitch results back with original IDs
        const finalResults: TranslationResult[] = translationResults.map(res => {
            const originalParsed = parsedStrings.find(p => p.original === res.original);
            return { ...res, id: originalParsed?.id };
        });

        setResults(finalResults);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Translation failed: ${err.message}`);
      } else {
        setError('An unknown error occurred during translation.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputContent, inputType, currentLanguages]);
  
  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (inputType !== 'arb' && inputType !== 'js') return;

    const isTextareaEmpty = event.currentTarget.value.trim() === '';
    const pastedText = event.clipboardData.getData('text');
    let processedText = pastedText.trim();

    // Only format if the textarea is empty and the paste looks like a fragment
    if (isTextareaEmpty && !processedText.startsWith('{') && processedText.includes(':')) {
      event.preventDefault();

      if (processedText.endsWith(',')) {
        processedText = processedText.slice(0, -1);
      }
      // Add some nice formatting for readability
      const formattedPaste = `{\n  ${processedText}\n}`;
      setInputContent(formattedPaste);
    }
  }, [inputType]);

  const { label, placeholder } = useMemo(() => {
    switch (inputType) {
        case 'arb': return { label: 'Paste ARB File Content', placeholder: '{\n  "hello": "Hello World",\n  "@hello": { "description": "A greeting" }\n}\n\nOr just paste the key-value pairs directly.' };
        case 'js': return { label: 'Paste JS/TS Intl Message Objects', placeholder: "myMessage: {\n  id: 'my.message',\n  defaultMessage: 'This is my message',\n}," };
        case 'text': return { label: 'Enter English Strings (one per line)', placeholder: 'You have {count} items in your cart.\nHello, {name}!' };
        default: return { label: '', placeholder: '' };
    }
  }, [inputType]);
  
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 bg-slate-50 rounded-xl shadow-lg p-6 md:p-8 border border-slate-200">
          <div className="space-y-8">
            {/* Step 1: Input Format */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-800">Step 1: Choose Your Input Format</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <OptionCard title="ARB File" description="For Flutter's .arb localization files." selected={inputType === 'arb'} onClick={() => setInputType('arb')} icon={<CodeBracketIcon className="h-6 w-6 text-blue-600" />} />
                    <OptionCard title="JS/TS Messages" description="For react-intl message definitions." selected={inputType === 'js'} onClick={() => setInputType('js')} icon={<CodeBracketIcon className="h-6 w-6 text-blue-600" />} />
                    <OptionCard title="Plain Text / List" description="Simple list of strings, one per line." selected={inputType === 'text'} onClick={() => setInputType('text')} icon={<DocumentTextIcon className="h-6 w-6 text-blue-600" />} />
                </div>
            </div>

            {/* Step 2: Language Arrangement */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-800">Step 2: Choose Language Arrangement</h2>
                 <div className="flex flex-wrap gap-2">
                    {arrangementOptions.map(key => (
                         <button key={key} onClick={() => setArrangement(key as Arrangement)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${arrangement === key ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>
                {arrangement === 'custom' ? (
                     <input
                        type="text"
                        value={customLanguages}
                        onChange={(e) => setCustomLanguages(e.target.value)}
                        placeholder="e.g., ja, ko, zh-CN"
                        className="mt-2 block w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ) : (
                    <div className="mt-2 flex items-start gap-2 text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200">
                        <InformationCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-700">Languages to be translated:</p>
                            <p className="text-xs font-mono text-slate-500 leading-relaxed break-words mt-1">
                                {currentLanguages.join(', ')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            <IcuInput 
              value={inputContent} 
              onChange={(e) => setInputContent(e.target.value)} 
              onPaste={handlePaste}
              label={label} 
              placeholder={placeholder} 
            />
            <TranslateButton onClick={handleTranslate} isLoading={isLoading} />
            
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {results.length > 0 && <ResultDisplay results={results} languages={currentLanguages} inputType={inputType} />}
          </div>
        </main>
         <footer className="text-center mt-8 text-sm text-slate-500">
            <p>Powered by Google Gemini. Designed for Flutter developers.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;