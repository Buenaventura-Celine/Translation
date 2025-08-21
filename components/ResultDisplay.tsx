
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 text-xs font-medium"
        >
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-400" />
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
    <div className="mt-6">
       <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-slate-300">
          Translations ({results.length} strings)
        </label>
         <div className="flex items-center gap-2">
            {showIdColumn && <CopyButton onClick={handleCopyIds} text="Copy IDs" copiedText="IDs Copied!" />}
            <CopyButton onClick={handleCopyTranslations} text="Copy Translations" copiedText="Translations Copied!" />
            <CopyButton onClick={handleCopyAll} text="Copy All" copiedText="Table Copied!" />
         </div>
      </div>
      <div className="bg-slate-900/70 border border-slate-600 rounded-lg max-h-[60vh] overflow-auto">
        <table className="w-full text-sm text-left text-slate-300 table-fixed">
            <thead className="text-xs text-sky-300 uppercase bg-slate-800 sticky top-0 z-10">
                <tr>
                    {showIdColumn && <th scope="col" className="px-4 py-3 w-[15%]">ID</th>}
                    <th scope="col" className="px-4 py-3 w-1/4">Original English</th>
                    {languages.map(lang => (
                        <th scope="col" key={lang} className="px-4 py-3 w-1/4">{lang.toUpperCase()}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {results.map((result, index) => (
                    <tr key={index} className="hover:bg-slate-800/50">
                        {showIdColumn && <td className="px-4 py-3 font-mono text-pink-400 whitespace-pre-wrap break-words align-top">{result.id}</td>}
                        <td className="px-4 py-3 font-mono text-slate-100 whitespace-pre-wrap break-words align-top">{result.original}</td>
                        {languages.map(lang => (
                            <td key={lang} className="px-4 py-3 font-mono whitespace-pre-wrap break-words align-top">
                                {result.translations[lang] || <span className="text-slate-500">...</span>}
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
