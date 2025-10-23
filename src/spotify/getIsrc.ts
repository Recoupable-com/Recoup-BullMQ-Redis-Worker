import { SpotifyTrack } from "../types/spotify.types";

type GetIsrcParams = {
  isrc: string;
  market?: string;
};

type RecoupSearchResponse = {
  tracks?: {
    items: SpotifyTrack[];
    limit: number;
    offset: number;
    total: number;
    next?: string;
    previous?: string;
  };
};

const getIsrc = async ({
  isrc,
  market,
}: GetIsrcParams): Promise<{
  track: SpotifyTrack | null;
  error: Error | null;
}> => {
  try {
    const params = new URLSearchParams({
      q: `isrc:${isrc}`,
      type: "track",
      limit: "1",
    });

    if (market) {
      params.append("market", market);
    }

    const response = await fetch(
      `https://api.recoupable.com/api/spotify/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Recoup API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as RecoupSearchResponse;
    const track = data?.tracks?.items?.[0] ?? null;

    return { track, error: null };
  } catch (unknownError) {
    return {
      track: null,
      error:
        unknownError instanceof Error
          ? unknownError
          : new Error("Unknown error fetching Spotify track by ISRC"),
    };
  }
};

export default getIsrc;
