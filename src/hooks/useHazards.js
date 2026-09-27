import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getHazards,
} from "../services/api.js";

export function useHazards() {
  const [hazards, setHazards] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const refresh =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getHazards();

        setHazards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    hazards,
    loading,
    error,
    refresh,
  };
}