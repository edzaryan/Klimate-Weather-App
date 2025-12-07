import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";


export interface FavoriteCity {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  addedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>("favorites", []);
  const queryClient = useQueryClient();
  const key = ["favorites"];

  const favoritesQuery = useQuery({
    queryKey: key,
    queryFn: () => favorites,
    initialData: favorites,
    staleTime: Infinity,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const addFavorite = useMutation({
    mutationFn: async (city: Omit<FavoriteCity, "id" | "addedAt">) => {
      const id = `${city.lat}-${city.lon}`;
      if (favorites.some((f) => f.id === id)) return favorites;

      const newFavorites = [
        ...favorites,
        { ...city, id, addedAt: Date.now() },
      ];

      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: invalidate,
  });

  const removeFavorite = useMutation({
    mutationFn: async (cityId: string) => {
      const newFavorites = favorites.filter((c) => c.id !== cityId);
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: invalidate,
  });

  return {
    favorites: favoritesQuery.data,
    addFavorite,
    removeFavorite,
    isFavorite: (lat: number, lon: number) =>
      favorites.some((c) => c.lat === lat && c.lon === lon),
  };
}
