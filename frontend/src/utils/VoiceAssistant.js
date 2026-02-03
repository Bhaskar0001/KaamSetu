const getVoices = () => {
    return new Promise(resolve => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
            return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
        };
    });
};

export const speak = async (text, lang = 'hi') => {
    if (!('speechSynthesis' in window)) return;

    try {
        const voices = await getVoices();
        const utterance = new SpeechSynthesisUtterance(text);

        // Better language matching
        const targetLang = lang === 'hi' ? 'hi-IN' : 'en-US';
        const voice = voices.find(v => v.lang.includes(targetLang)) || voices.find(v => v.lang.includes(lang === 'hi' ? 'hi' : 'en'));

        if (voice) utterance.voice = voice;
        utterance.lang = targetLang;
        utterance.rate = 1.0;

        // CRITICAL: Cancel any pending speech to force new one
        window.speechSynthesis.cancel();

        // Small delay to allow cancellation to take effect
        setTimeout(() => {
            console.log(`Speaking: ${text} | Voice: ${voice ? voice.name : 'Default'}`);
            window.speechSynthesis.speak(utterance);
        }, 50);

    } catch (e) {
        console.error("TTS Failed:", e);
    }
};

export const greetUser = (name, lang = 'hi') => {
    const hour = new Date().getHours();
    let greeting = '';

    // Hindi logic
    if (lang === 'hi') {
        if (hour < 12) greeting = 'सुप्रभात (Suprabhat)';
        else if (hour < 17) greeting = 'नमस्ते (Namaste)';
        else greeting = 'शुभ संध्या (Shubh Sandhya)';

        speak(`${greeting.split(' ')[0]} ${name}, आज का काम शुरू करें?`, 'hi');
    } else {
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 17) greeting = 'Hello';
        else greeting = 'Good Evening';

        speak(`${greeting} ${name}, ready for work?`, 'en');
    }
    return;
};
