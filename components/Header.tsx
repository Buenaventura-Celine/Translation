import React from 'react';
import { TranslateIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex justify-center items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-full">
            <TranslateIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          ICU Message Translator
        </h1>
      </div>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Translate your Flutter ICU messages into multiple languages at once, preserving all your dynamic placeholders.
      </p>
    </header>
  );
};