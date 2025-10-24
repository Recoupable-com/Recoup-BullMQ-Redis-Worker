import { SpotifyTrack } from "../types/spotify.types";
import { getArtistsWithGenres } from "./getArtistsWithGenres";
import { generateLLMNotes, TrackInfo } from "../ai/generateLLMNotes";

/**
 * Generates descriptive notes for a Spotify track using AI
 * @param track - The raw Spotify track object from getIsrc
 * @returns Promise containing the generated notes
 */
export const generateTrackNotes = async (
  track: SpotifyTrack
): Promise<string> => {
  if (!track.name) {
    return "";
  }
  const albumName = track.album.name || "Unknown Album";
  const artistsWithGenres = await getArtistsWithGenres(track);
  const durationMinutes = Math.floor(track.duration_ms / 60000);
  const durationSeconds = Math.floor((track.duration_ms % 60000) / 1000);
  const durationFormatted = `${durationMinutes}:${durationSeconds
    .toString()
    .padStart(2, "0")}`;
  try {
    const trackInfo: TrackInfo = {
      name: track.name,
      artists: artistsWithGenres,
      album: albumName,
      releaseDate: track.album.release_date,
      popularity: track.popularity,
      duration: durationFormatted,
      explicit: track.explicit,
    };

    return await generateLLMNotes(trackInfo);
  } catch (error) {
    console.error("Error generating track notes with AI:", error);
    return `${
      track.name
    } by ${artistsWithGenres} - a musical track from ${albumName}. The track was released on ${
      track.album.release_date
    }, has a popularity score of ${
      track.popularity
    }/100 and a duration of ${durationFormatted}. It has an explicit flag of ${
      track.explicit ? "true" : "false"
    }.`;
  }
};
