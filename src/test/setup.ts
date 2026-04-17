import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the GoogleGenAI SDK to prevent actual API calls during tests
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: function() {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: '{"message": "Test response", "suggestedAction": "Test action"}',
          }),
        },
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
    },
  };
});
