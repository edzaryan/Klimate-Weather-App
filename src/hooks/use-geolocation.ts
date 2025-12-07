import { useState, useEffect } from "react";
import type { Coordinates } from "@/api/types";

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  const setError = (message: string) =>
    setState({ coordinates: null, error: message, isLoading: false });

  const getLocation = () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    if (!navigator.geolocation)
      return setError("Geolocation is not supported by your browser");

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          coordinates: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          },
          error: null,
          isLoading: false,
        }),

      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please enable location access."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Location information is unavailable."
            : err.code === err.TIMEOUT
            ? "Location request timed out."
            : "An unknown error occurred.";

        setError(message);
      },

      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { ...state, getLocation };
}
