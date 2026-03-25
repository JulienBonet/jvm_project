import { useState } from 'react';
import { ReleaseMDetail } from '../types/entities/release.types';

export function useReleaseDetail(backendUrl: string, showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void) {
    const [selectedRelease, setSelectedRelease] = useState<ReleaseMDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const fetchSelectedRelease = async (id: number) => {
    try {
      setLoadingDetail(true);

      const res = await fetch(`${backendUrl}/api/release/${id}`);
      if (!res.ok) throw new Error('Erreur serveur');

      const data = await res.json();

      setSelectedRelease(data);
      setOpenDetail(true);
    } catch (err) {
      console.error(err);
      showSnackbar('Erreur chargement release', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  return {
    selectedRelease,
    setSelectedRelease,
    loadingDetail,
    openDetail,
    setOpenDetail,
    fetchSelectedRelease,
  };
}