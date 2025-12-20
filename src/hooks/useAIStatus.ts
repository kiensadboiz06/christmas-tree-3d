import { useState } from 'react';

export const useAIStatus = () => {
  const [aiStatus, setAiStatus] = useState('INITIALIZING...');

  return {
    aiStatus,
    setAiStatus
  };
};

