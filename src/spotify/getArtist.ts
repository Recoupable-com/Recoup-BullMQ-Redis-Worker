import { SpotifyArtist } from "../types/spotify.types";

type RecoupArtistResponse = {
  artist: SpotifyArtist | null;
  error: Error | null;
};

const getArtist = async (
  id: string
): Promise<{ artist: SpotifyArtist | null; error: Error | null }> => {
  try {
    const response = await fetch(
      `https://api.recoupable.com/api/spotify/artist/?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { error: new Error("Recoup API request failed"), artist: null };
    }

    const data = (await response.json()) as RecoupArtistResponse;
    return { error: data.error, artist: data.artist };
  } catch (error) {
    console.error(error);
    return {
      artist: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching artist"),
    };
  }
};

export default getArtist;
