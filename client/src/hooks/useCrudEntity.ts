import { useState, useCallback } from 'react';

interface UseCrudEntityParams {
  listEndpoint: string;
  baseEndpoint: string;
}

function useCrudEntity<T>({
  listEndpoint,
  baseEndpoint,
}: UseCrudEntityParams) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* =======================
        FETCH ALL
  ======================= */
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}${listEndpoint}`);
      if (!res.ok) throw new Error('Erreur serveur');

      const result: T[] = await res.json();
      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl, listEndpoint]);

  /* =======================
        CREATE
  ======================= */
  const create = async (formData: FormData): Promise<T> => {
    const res = await fetch(`${backendUrl}${baseEndpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Erreur création');

    const result: T = await res.json();
    await fetchAll();
    return result;
  };

  /* =======================
        UPDATE
  ======================= */
  const update = async (id: number, formData: FormData): Promise<T> => {
    const res = await fetch(`${backendUrl}${baseEndpoint}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) throw new Error('Erreur update');

    const result: T = await res.json();
    await fetchAll();
    return result;
  };

  /* =======================
        DELETE
  ======================= */
  const remove = async (id: number): Promise<void> => {
    const res = await fetch(`${backendUrl}${baseEndpoint}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Erreur suppression');

    await fetchAll();
  };

  return {
    data,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  };
}

export default useCrudEntity;