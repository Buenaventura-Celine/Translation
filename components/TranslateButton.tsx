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
      className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-900 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? 'Translating...' : 'Translate'}
    </button>
  );
};