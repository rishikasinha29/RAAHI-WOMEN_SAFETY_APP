import {
  useCallback,
  useState,
} from "react";

export function useGeolocation() {
  const [location, setLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const getLocation =
    useCallback(() => {
      if (!navigator.geolocation) {
        setError(
          "Geolocation is not supported by this browser."
        );
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat:
              position.coords.latitude,

            lon:
              position.coords.longitude,
          });

          setLoading(false);
        },

        (err) => {
          setLoading(false);

          if (
            err.code ===
            err.PERMISSION_DENIED
          ) {
            setError(
              "Location permission was denied."
            );
          } else if (
            err.code ===
            err.POSITION_UNAVAILABLE
          ) {
            setError(
              "Your location is currently unavailable."
            );
          } else {
            setError(
              "Unable to determine your location."
            );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    }, []);

  return {
    location,
    loading,
    error,
    getLocation,
  };
}