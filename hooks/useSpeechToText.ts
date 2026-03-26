import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { api } from '../api/client';

interface UseSpeechToTextReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  resetTranscript: () => void;
}

export const useSpeechToText = (): UseSpeechToTextReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Permission de microphone refusée');
        return;
      }

      // Prepare audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      setError('Erreur lors du démarrage de l\'enregistrement');
      console.log('[useSpeechToText] Recording error:', err);
    }
  };

  const stopRecording = async (): Promise<string> => {
    return new Promise(async (resolve) => {
      try {
        if (!recordingRef.current) {
          resolve('');
          return;
        }

        setIsProcessing(true);
        await recordingRef.current.stopAndUnloadAsync();

        const uri = recordingRef.current.getURI();
        if (!uri) {
          resolve('');
          setIsProcessing(false);
          return;
        }

        // Send to backend transcription API
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        } as any);

        try {
          const response = await api.post('/ai/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const text = response.data?.text || '';
          setTranscript(text);
          resolve(text);
        } catch (apiErr) {
          setError('Erreur lors de la transcription');
          console.log('[useSpeechToText] Transcription error:', apiErr);
          resolve('');
        }

        setIsRecording(false);
        setIsProcessing(false);
      } catch (err) {
        setError('Erreur lors de l\'arrêt de l\'enregistrement');
        console.log('[v0] Stop recording error:', err);
        setIsProcessing(false);
        resolve('');
      }
    });
  };

  const resetTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
  };
};
