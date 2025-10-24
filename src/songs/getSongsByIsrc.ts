import getIsrc from "../spotify/getIsrc";
import { generateTrackNotes } from "./generateTrackNotes";
import { upsertSongs } from "../supabase/songs/upsertSongs";

export type ProcessedIsrcResult = {
  isrc: string;
  notes: string;
};

const getSongsByIsrc = async (
  isrcs: string[]
): Promise<ProcessedIsrcResult[]> => {
  if (isrcs.length === 0) return [];

  const spotifyTrackByIsrc = new Map<string, string>();

  await Promise.all(
    isrcs.map(async (isrc) => {
      const { track, error } = await getIsrc({ isrc });

      if (error) {
        console.error(
          `❌ Error fetching track for ISRC ${isrc}:`,
          error.message
        );
        return;
      }

      if (track) {
        const notes = await generateTrackNotes(track);

        spotifyTrackByIsrc.set(isrc, notes);

        // Upsert immediately after generating notes
        try {
          await upsertSongs([{ isrc, notes }]);
          console.log(`✅ Successfully upserted song: ${isrc}`);
        } catch (error) {
          console.error(
            `❌ Error upserting song ${isrc}:`,
            (error as Error).message
          );
        }
      }
    })
  );

  return isrcs.map((isrc) => {
    const notes = spotifyTrackByIsrc.get(isrc);

    return {
      isrc,
      notes: notes || "",
    };
  });
};

export default getSongsByIsrc;
