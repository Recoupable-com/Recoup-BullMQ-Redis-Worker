import { generateText, stepCountIs } from "ai";
import getSearchWebTool from "../perplexity/getSearchWebTool";

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
 * Generates descriptive notes for a track using AI with web search capabilities
 * @param trackInfo - Structured track information
 * @returns Promise containing the AI-generated notes
 */
export const generateLLMNotes = async (
  trackInfo: TrackInfo
): Promise<string> => {
  const systemPrompt = `You are an expert music analyst creating concise track descriptions for AI-powered playlist recommendation systems. Your descriptions will be processed in batches of 100 songs by another LLM, so they must be brief, structured, and easy to compare.

CRITICAL REQUIREMENTS:
- Keep descriptions under 150 words
- Use structured format with clear tags
- Focus on playlist-relevant attributes
- Make comparisons easy for batch processing
- ALWAYS include ALL provided track data (name, artists, album, release date, popularity, duration, explicit status)

MANDATORY: Use web search to gather essential information about genre, mood, energy, cultural context, and target audience.

OUTPUT FORMAT:
Track: [song name]
Artist: [artist names]
Album: [album name]
Released: [release date]
Popularity: [score]/100
Duration: [duration]
Explicit: [Yes/No]
Genre: [primary genres]
Mood: [emotional tone - 2-3 words]
Energy: [1-10 scale]
Tempo: [slow/medium/fast]
Themes: [key lyrical/cultural themes - 3-4 words max]
Audience: [target demographic - 2-3 words]
Occasions: [suitable contexts - comma-separated]
Brand Fit: [brand alignment - 2-3 words]
Tags: [comma-separated keywords for filtering]

EXAMPLES:
- "Halloween Playlist for Peloton" → Look for: spooky, energetic, thematic, workout-suitable
- "Valentine's Playlist for Nike" → Look for: romantic, motivational, emotional, athletic
- "LGBTQ+ Playlist for Shopify" → Look for: inclusive, empowering, celebratory, diverse

Keep descriptions factual, concise, and optimized for algorithmic playlist matching. Include both provided metadata and web-researched insights.`;

  const userPrompt = `Track: ${trackInfo.name}
Artist(s): ${trackInfo.artists}
Album: ${trackInfo.album}
Release Date: ${trackInfo.releaseDate}
Popularity: ${trackInfo.popularity}/100
Duration: ${trackInfo.duration}
Explicit: ${trackInfo.explicit ? "Yes" : "No"}`;

  const { text } = await generateText({
    model: DEFAULT_MODEL,
    system: systemPrompt,
    prompt: userPrompt,
    tools: {
      searchWeb: getSearchWebTool(),
    },
    stopWhen: stepCountIs(11),
  });
  console.log("Generated notes:", text);

  return text;
};
