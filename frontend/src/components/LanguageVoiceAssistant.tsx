import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Languages, 
  Sparkles, 
  Play, 
  CheckCircle2,
  Bot
} from 'lucide-react';
import { RecommendationResult } from '../types';

interface LanguageVoiceAssistantProps {
  currentRecommendation?: RecommendationResult | null;
  onVoiceQueryReceived?: (query: string) => void;
}

export const LanguageVoiceAssistant: React.FC<LanguageVoiceAssistantProps> = ({
  currentRecommendation,
  onVoiceQueryReceived
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('hi-IN');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  const languages = [
    { code: 'en-US', label: 'English', greeting: 'Welcome to PACKD AI packaging voice assistant.' },
    { code: 'hi-IN', label: 'हिंदी (Hindi)', greeting: 'नमस्ते! PACKD AI पैकेजिंग सहायक में आपका स्वागत है।' },
    { code: 'mr-IN', label: 'मराठी (Marathi)', greeting: 'नमस्कार! PACKD AI पॅकेजिंग सहाय्यकामध्ये आपले स्वागत आहे.' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)', greeting: 'வணக்கம்! PACKD AI பேக்கேஜிங் வழிகாட்டலுக்கு வரவேற்கிறோம்.' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)', greeting: 'నమస్కారం! PACKD AI ప్యాకేజింగ్ అసిస్టెంట్‌కి స్వాగతం.' },
    { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)', greeting: 'નમસ્તે! PACKD AI પેકેજિંગ સહાયકમાં આપનું સ્વાગત છે.' },
    { code: 'bn-IN', label: 'বাংলা (Bengali)', greeting: 'নমস্কার! PACKD AI প্যাকেজিং সহকারীতে স্বাগতম।' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', greeting: 'ನಮಸ್ಕಾರ! PACKD AI ಪ್ಯಾಕೇಜಿಂಗ್ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ.' }
  ];

  const getAudioSummaryText = (langCode: string) => {
    if (!currentRecommendation) {
      const selected = languages.find(l => l.code === langCode);
      return selected ? selected.greeting : 'Welcome to PACKD AI.';
    }

    const commodity = currentRecommendation.commodity_name;
    const material = currentRecommendation.primary_material_name;
    const days = currentRecommendation.predicted_shelf_life_days;

    if (langCode === 'hi-IN') {
      return `आपके उत्पाद ${commodity} के लिए सर्वश्रेष्ठ पैकेजिंग सामग्री ${material} है। इसकी कुल मोटाई ${currentRecommendation.recommended_total_thickness_um} माइक्रोन है। यह पैकेजिंग आपके उत्पाद की शेल्फ लाइफ को ${days} दिनों तक सुरक्षित रखेगी।`;
    } else if (langCode === 'mr-IN') {
      return `तुमच्या ${commodity} साठी शिफारस केलेले पॅकेजिंग ${material} आहे. यामुळे उत्पादनाचे शेल्फ लाइफ ${days} दिवसांपर्यंत वाढेल.`;
    } else if (langCode === 'ta-IN') {
      return `உங்கள் ${commodity} பொருளுக்கு சிறந்த பேக்கேஜிங் ${material} ஆகும். இது ${days} நாட்கள் வரை தரத்தை பாதுகாக்கும்.`;
    } else if (langCode === 'te-IN') {
      return `మీ ${commodity} కోసం సిఫార్సు చేయబడిన ప్యాకేజింగ్ ${material}. ఇది ${days} రోజుల షెల్ఫ్ జీవితాన్ని అందిస్తుంది.`;
    } else if (langCode === 'gu-IN') {
      return `તમારા ${commodity} માટે શ્રેષ્ઠ પેકેજિંગ ${material} છે. આ પેકેજિંગ ${days} દિવસ સુધી ગુણવત્તા જાળવી રાખશે.`;
    } else {
      return `For your product ${commodity}, the recommended packaging structure is ${material} with nominal gauge of ${currentRecommendation.recommended_total_thickness_um} microns, providing ${days} days of safe shelf life.`;
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = getAudioSummaryText(selectedLang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      if (onVoiceQueryReceived) {
        onVoiceQueryReceived(speechToText);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-brand-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Multilingual Voice & Vernacular Assistant (Bhashini AI)</h3>
            <p className="text-[11px] text-slate-400">Audio playback & voice queries in 8 Indian regional languages for farmers & FPOs</p>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-slate-400" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-medium focus:border-brand-400 focus:outline-none"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Voice Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Audio Playback Button */}
          <button
            onClick={handleSpeak}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Stop Audio Readout' : 'Listen in Selected Language'}</span>
          </button>

          {/* Voice Input Mic Button */}
          <button
            onClick={handleStartListening}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Speak your food item query"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <span className="text-[11px] text-slate-400 text-center sm:text-right">
          {transcript ? (
            <span className="text-brand-400 font-medium">Heard: "{transcript}"</span>
          ) : (
            'Click microphone to ask voice questions about your food packaging.'
          )}
        </span>
      </div>
    </div>
  );
};
