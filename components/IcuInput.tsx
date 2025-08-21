
import React from 'react';

interface IcuInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  label: string;
  placeholder: string;
}

export const IcuInput: React.FC<IcuInputProps> = ({ value, onChange, onPaste, label, placeholder }) => {
  return (
    <div>
      <label htmlFor="icu-input" className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <textarea
        id="icu-input"
        rows={8}
        className="block w-full bg-slate-900/70 border border-slate-600 rounded-lg shadow-sm p-4 text-slate-200 placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onPaste={onPaste}
      />
    </div>
  );
};
