import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

interface TypingMessageProps {
    text: string;
    onComplete?: () => void;
}

export const TypingMessage = ({ text, onComplete }: TypingMessageProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                // Render chunks of 3 characters for better performance and speed
                const nextIndex = Math.min(currentIndex + 3, text.length);
                setDisplayedText(text.slice(0, nextIndex));
                setCurrentIndex(nextIndex);
            }, 10); // Slightly longer delay but more chars = smoother 300chars/s approx
            return () => clearTimeout(timeout);
        } else if (onComplete) onComplete();
    }, [currentIndex, text]);

    return <Text className="text-base leading-6 text-slate-300">{displayedText}</Text>;
};

interface TypingPlaceholderProps {
    text: string;
    inputValue: string;
}

export const TypingPlaceholder = ({ text, inputValue }: TypingPlaceholderProps) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (inputValue) return setDisplayedText('');

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;
            } else clearInterval(interval);
        }, 30);

        return () => clearInterval(interval);
    }, [text, inputValue]);

    if (inputValue) return null;
    return <Text className="absolute left-4 top-4 text-base text-white/60">{displayedText}</Text>;
};
