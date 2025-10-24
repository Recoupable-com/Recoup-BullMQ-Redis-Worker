import { generateText } from "ai";

export const DEFAULT_MODEL = "openai/gpt-5-mini";

export interface TrackInfo {
  name: string;
  artists: string;
  album: string;
  releaseDate: string;
  popularity: number;
  duration: string;
  explicit: boolean;
}

/**
 * Generates descriptive notes for a track using AI
 * @param trackInfo - Structured track information
 * @returns Promise containing the AI-generated notes
 */
export const generateLLMNotes = async (
  trackInfo: TrackInfo
): Promise<string> => {
  const prompt = `Generate a descriptive note for this music track:

Track: ${trackInfo.name}
Artist(s): ${trackInfo.artists}
Album: ${trackInfo.album}
Release Date: ${trackInfo.releaseDate}
Popularity: ${trackInfo.popularity}/100
Duration: ${trackInfo.duration}
Explicit: ${trackInfo.explicit ? "Yes" : "No"}

Please create an engaging, informative description that captures the essence of this track. Include relevant details about the artist(s), genre information, and any notable characteristics. Keep it concise but descriptive.`;

  const { text } = await generateText({
    model: DEFAULT_MODEL,
    prompt,
  });

  return text;
};
