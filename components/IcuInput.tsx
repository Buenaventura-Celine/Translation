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
      <label htmlFor="icu-input" className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <textarea
        id="icu-input"
        rows={8}
        className="block w-full bg-white border border-slate-300 rounded-lg shadow-sm p-4 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onPaste={onPaste}
      />
    </div>
  );
};