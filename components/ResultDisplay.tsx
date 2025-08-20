import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';
import { LANGUAGES } from '../constants';
import { TranslationResult } from '../services/geminiService';

interface ResultDisplayProps {
  results: TranslationResult[];
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ results }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const rows = results.map(result => {
        const translations = LANGUAGES.map(lang => result.translations[lang]?.replace(/\n/g, ' ') || ''); // Replace newlines in translation to not break TSV
        return translations.join('\t');
    });

    const tsvContent = rows.join('\n');

    navigator.clipboard.writeText(tsvContent)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <div className="mt-6">
       <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-slate-300">
          Translations ({results.length} strings)
        </label>
         <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 text-xs font-medium"
          aria-label="Copy all translations as a table for spreadsheets"
        >
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-400" />
              Copied!
            </>
          ) : (
             <>
              <ClipboardIcon className="h-4 w-4" />
              Copy as Table
            </>
          )}
        </button>
      </div>
      <div className="bg-slate-900/70 border border-slate-600 rounded-lg max-h-[60vh] overflow-auto">
        <table className="w-full text-sm text-left text-slate-300 table-fixed">
            <thead className="text-xs text-sky-300 uppercase bg-slate-800 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-4 py-3 w-1/4">Original English</th>
                    {LANGUAGES.map(lang => (
                        <th scope="col" key={lang} className="px-4 py-3 w-1/4">{lang.toUpperCase()}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {results.map((result, index) => (
                    <tr key={index} className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-slate-100 whitespace-pre-wrap break-words align-top">{result.original}</td>
                        {LANGUAGES.map(lang => (
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