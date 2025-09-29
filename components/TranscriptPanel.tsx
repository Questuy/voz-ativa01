
import React from 'react';

interface TranscriptPanelProps {
  title: string;
  text: string;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ title, text }) => {
  return (
    <div className="bg-brand-dark rounded-xl p-6 w-full shadow-lg">
      <h3 className="text-sm font-semibold text-brand-primary mb-2">{title}</h3>
      <p className="text-gray-100 min-h-[50px] text-lg">
        {text || <span className="text-teal-500">...</span>}
      </p>
    </div>
  );
};

export default TranscriptPanel;