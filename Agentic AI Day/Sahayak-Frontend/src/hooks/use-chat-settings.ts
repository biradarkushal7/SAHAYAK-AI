
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ChatSettings {
  state: string;
  language: string;
  targetGrades: number[];
  tone: string;
  complexity: string;
  voiceOutput: boolean;
}

const stateToLanguageMap: Record<string, string> = {
  "Andhra Pradesh": "Telugu",
  "Arunachal Pradesh": "English",
  "Assam": "Assamese",
  "Bihar": "Hindi",
  "Chhattisgarh": "Hindi",
  "Goa": "Konkani",
  "Gujarat": "Gujarati",
  "Haryana": "Hindi",
  "Himachal Pradesh": "Hindi",
  "Jharkhand": "Hindi",
  "Karnataka": "Kannada",
  "Kerala": "Malayalam",
  "Madhya Pradesh": "Hindi",
  "Maharashtra": "Marathi",
  "Manipur": "Meiteilon (Manipuri)",
  "Meghalaya": "English",
  "Mizoram": "Mizo",
  "Nagaland": "English",
  "Odisha": "Odia",
  "Punjab": "Punjabi",
  "Rajasthan": "Hindi",
  "Sikkim": "Nepali",
  "Tamil Nadu": "Tamil",
  "Telangana": "Telugu",
  "Tripura": "Bengali",
  "Uttar Pradesh": "Hindi",
  "Uttarakhand": "Hindi",
  "West Bengal": "Bengali"
};

export const indianLanguages = [
    "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", "Kannada", 
    "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", "Marathi", "Meiteilon (Manipuri)", "Mizo",
    "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi", "Tamil", "Telugu", "Urdu"
];


const defaultSettings: ChatSettings = {
  state: '',
  language: '',
  targetGrades: [],
  tone: 'friendly',
  complexity: 'medium',
  voiceOutput: false,
};

const SETTINGS_KEY = 'chat-settings';

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        // Merge saved settings with defaults to ensure all keys are present
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load chat settings from localStorage', error);
      setSettings(defaultSettings);
    } finally {
        setIsSettingsLoaded(true);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ChatSettings>) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      
      // If the state is changing, and we are not also explicitly changing the language
      // then auto-detect the language from the state.
      if (newSettings.state && !newSettings.language && newSettings.state !== prevSettings.state) {
        const detectedLanguage = stateToLanguageMap[newSettings.state];
        if (detectedLanguage) {
          updated.language = detectedLanguage;
        }
      }

      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save chat settings to localStorage', error);
      }
      return updated;
    });
  }, []);

  return { settings, updateSettings, isSettingsLoaded };
}
