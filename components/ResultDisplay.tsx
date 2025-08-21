import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

// These types must be kept in sync with App.tsx
interface TranslationResult {
  id?: string;
  original: string;
  translations: Record<string, string>;
}
type InputType = 'arb' | 'js' | 'text';


interface ResultDisplayProps {
  results: TranslationResult[];
  languages: string[];
  inputType: InputType;
}

const CopyButton: React.FC<{ onClick: () => void; text: string; copiedText: string; }> = ({ onClick, text, copiedText }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        onClick();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    return (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 text-xs font-medium"
        >
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-500" />
              {copiedText}
            </>
          ) : (
             <>
              <ClipboardIcon className="h-4 w-4" />
              {text}
            </>
          )}
        </button>
    );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ results, languages, inputType }) => {
  const showIdColumn = inputType === 'arb' || inputType === 'js';

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).catch(err => console.error('Failed to copy text: ', err));
  };
  
  const handleCopyIds = () => {
    const content = results.map(r => r.id || '').join('\n');
    copyToClipboard(content);
  };
  
  const handleCopyTranslations = () => {
    const rows = results.map(result => {
        const translations = languages.map(lang => result.translations[lang]?.replace(/\t|\n/g, ' ') || '');
        return translations.join('\t');
    });
    copyToClipboard(rows.join('\n'));
  };

  const handleCopyAll = () => {
    const rows = results.map(result => {
        const translations = languages.map(lang => result.translations[lang]?.replace(/\t|\n/g, ' ') || '');
        const base = [result.original];
        if (showIdColumn) {
            base.unshift(result.id || '');
        }
        return [...base, ...translations].join('\t');
    });
    copyToClipboard(rows.join('\n'));
  };


  return (
    <div>
       <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-slate-700">
          Translations ({results.length} strings)
        </label>
         <div className="flex items-center gap-2">
            {showIdColumn && <CopyButton onClick={handleCopyIds} text="Copy IDs" copiedText="IDs Copied!" />}
            <CopyButton onClick={handleCopyTranslations} text="Copy Translations" copiedText="Translations Copied!" />
            <CopyButton onClick={handleCopyAll} text="Copy All" copiedText="Table Copied!" />
         </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg max-h-[75vh] overflow-auto shadow-sm">
        <table className="min-w-full text-sm text-left text-slate-600 table-auto">
            <thead className="text-sm font-medium text-slate-700 bg-slate-50/80 backdrop-blur sticky top-0 z-10 border-b border-slate-200">
                <tr>
                    {showIdColumn && <th scope="col" className="px-6 py-3 min-w-48">ID</th>}
                    <th scope="col" className="px-6 py-3 min-w-80">Original English</th>
                    {languages.map(lang => (
                        <th scope="col" key={lang} className="px-6 py-3 min-w-80">{lang.toUpperCase()}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/75">
                {results.map((result, index) => (
                    <tr key={index} className="even:bg-slate-50/50 hover:bg-slate-50 transition-colors duration-150">
                        {showIdColumn && <td className="px-6 py-4 font-mono text-indigo-600 whitespace-pre-wrap break-words align-top">{result.id}</td>}
                        <td className="px-6 py-4 font-mono text-slate-800 whitespace-pre-wrap break-words align-top">{result.original}</td>
                        {languages.map(lang => (
                            <td key={lang} className="px-6 py-4 font-mono whitespace-pre-wrap break-words align-top">
                                {result.translations[lang] || <span className="text-slate-400">...</span>}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};