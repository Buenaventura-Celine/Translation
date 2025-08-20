
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { IcuInput } from './components/IcuInput';
import { TranslateButton } from './components/TranslateButton';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { translateIcuStrings, TranslationResult } from './services/geminiService';

const App: React.FC = () => {
  const [icuString, setIcuString] = useState<string>('You have {count, plural, =0{no new messages} =1{1 new message} other{{count} new messages}}.\nHello, {name}!');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = useCallback(async () => {
    const stringsToTranslate = icuString.split('\n').filter(s => s.trim() !== '');
    if (stringsToTranslate.length === 0) {
      setError('Please enter at least one string to translate.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const translationResults = await translateIcuStrings(stringsToTranslate);
      setResults(translationResults);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Translation failed: ${err.message}`);
      } else {
        setError('An unknown error occurred during translation.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [icuString]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 bg-slate-800/50 rounded-xl shadow-2xl p-6 md:p-8 border border-slate-700">
          <div className="space-y-6">
            <IcuInput value={icuString} onChange={(e) => setIcuString(e.target.value)} />
            <TranslateButton onClick={handleTranslate} isLoading={isLoading} />
            
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {results.length > 0 && <ResultDisplay results={results} />}
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
