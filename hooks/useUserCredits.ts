import { useState, useEffect } from 'react';
import { api } from '../api/client';

export interface CreditsData {
  promptsLimit: number;
  imagesLimit: number;
  videosLimit: number;
  audioLimit: number;
  promptsUsed: number;
  imagesUsed: number;
  videosUsed: number;
  audioUsed: number;
  planType?: string;
}

export const useUserCredits = (refreshTrigger?: boolean) => {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, [refreshTrigger]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/ai/payment/credits');
      const data = resp.data?.data ?? resp.data;
      
      setCredits({
        promptsLimit: data.promptsLimit || 0,
        imagesLimit: data.imagesLimit || 0,
        videosLimit: data.videosLimit || 0,
        audioLimit: data.audioLimit || 0,
        promptsUsed: data.promptsUsed || 0,
        imagesUsed: data.imagesUsed || 0,
        videosUsed: data.videosUsed || 0,
        audioUsed: data.audioUsed || 0,
        planType: data.planType || 'curieux',
      });
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erreur');
      console.error('Error fetching credits:', err);
    } finally {
      setLoading(false);
    }
  };

  return { credits, loading, error, refetch: fetchCredits };
};
