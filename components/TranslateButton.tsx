
import React from 'react';

interface TranslateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? 'Translating...' : 'Translate'}
    </button>
  );
};
