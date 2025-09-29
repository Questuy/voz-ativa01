
import React from 'react';
import { Language, LanguageOption } from '../types';

interface LanguageSelectorProps {
  id: string;
  label: string;
  value: Language;
  onChange: (value: Language) => void;
  options: LanguageOption[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, label, value, onChange, options }) => {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="mb-2 text-sm font-medium text-teal-200">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="bg-brand-dark/80 border border-brand-primary/30 text-gray-100 text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;