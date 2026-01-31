import React, { useState, useEffect } from 'react';

const VoiceAssistant = ({ onSpeechResult, label }) => {
    const [isListening, setIsListening] = useState(false);
    const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            setBrowserSupportsSpeech(false);
        }
    }, []);

    const startListening = () => {
        if (!browserSupportsSpeech) {
            alert('Browser does not support speech recognition');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Default to Indian English, can make toggleable for Hindi

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onSpeechResult(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="voice-assistant" style={{ marginTop: '5px', marginBottom: '10px' }}>
            <button
                type="button"
                onClick={startListening}
                className="btn btn-secondary"
                style={{ background: isListening ? 'red' : '#333', fontSize: '0.9rem' }}
            >
                {isListening ? 'Listening...' : '🎤 Speak input'}
            </button>
            {!browserSupportsSpeech && <small>Browser does not support speech</small>}
        </div>
    );
};

export default VoiceAssistant;
