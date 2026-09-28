declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
  }
}

let googleMapsLoader: Promise<any> | null = null;

export function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to the workspace .env file."));
  }

  if (window.google?.maps) return Promise.resolve(window.google);

  if (!googleMapsLoader) {
    googleMapsLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      window.gm_authFailure = () => reject(new Error("Google rejected the Maps API key. Check its referrer restrictions and enabled APIs."));
      script.onload = () => window.google?.maps
        ? resolve(window.google)
        : reject(new Error("Google Maps loaded without its Maps library."));
      script.onerror = () => reject(new Error("Google Maps could not load. Check the API key and enabled APIs."));
      document.head.appendChild(script);
    }).catch((error) => {
      googleMapsLoader = null;
      throw error;
    });
  }

  return googleMapsLoader;
}