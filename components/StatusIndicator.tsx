import React from 'react';
import { AppStatus } from '../types';

interface StatusIndicatorProps {
  status: AppStatus;
}

const ListeningIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
    <span>Ouvindo...</span>
  </div>
);

const ProcessingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
    <svg className="animate-spin h-5 w-5 text-brand-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Traduzindo...</span>
  </div>
);

const SpeakingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
     <svg className="h-5 w-5 text-brand-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z" fill="currentColor"/>
        <path d="M9 7v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z" fill="currentColor"/>
        <path d="M15 4v16a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2z" fill="currentColor"/>
    </svg>
    <span>Falando...</span>
  </div>
);


const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusContent = () => {
    switch (status) {
      case 'listening':
        return <ListeningIndicator />;
      case 'processing':
        return <ProcessingIndicator />;
      case 'speaking':
        return <SpeakingIndicator />;
      case 'error':
        return <span className="text-red-400">Ocorreu um erro. Por favor, tente novamente.</span>;
      case 'idle':
      default:
        return <span className="text-teal-300">Pronto para traduzir</span>;
    }
  };

  return (
    <div className="flex items-center justify-center h-8 my-4 text-lg">
      {getStatusContent()}
    </div>
  );
};

export default StatusIndicator;