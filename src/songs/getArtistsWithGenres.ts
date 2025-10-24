import { SpotifyTrack } from "../types/spotify.types";
import getArtist from "../spotify/getArtist";

/**
 * Fetches artist details with genres for all artists in a track
 * @param track - The Spotify track containing artists
 * @returns Promise containing formatted artist strings with genres
 */
export const getArtistsWithGenres = async (
  track: SpotifyTrack
): Promise<string> => {
  // Fetch artist details in parallel
  const artistPromises = track.artists.map((artist) => getArtist(artist.id));
  const artistResults = await Promise.all(artistPromises);

  // Create artist-genre pairs from successful fetches
  const artistGenrePairs = track.artists.map((artist, index) => {
    const result = artistResults[index];
    if (result.artist && !result.error && result.artist.genres.length > 0) {
      const genres = result.artist.genres.join(", ");
      return `${artist.name} (artist genres: ${genres})`;
    }
    return artist.name;
  });

  return artistGenrePairs.join(", ");
};
