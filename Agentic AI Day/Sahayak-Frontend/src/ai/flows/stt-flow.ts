'use server';
/**
 * @fileOverview A speech-to-text AI agent.
 *
 * - transcribeAudio - A function that handles the speech-to-text conversion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranscribeInputSchema = z.object({
    audioDataUri: z.string().describe(
        "A recording of speech, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const sttFlow = ai.defineFlow(
    {
        name: 'sttFlow',
        inputSchema: TranscribeInputSchema,
        outputSchema: z.string(),
    },
    async ({ audioDataUri }) => {
        const { text } = await ai.generate({
            prompt: [{ media: { url: audioDataUri } }, { text: 'Transcribe the following audio.' }],
        });

        return text;
    }
);

export async function transcribeAudio(audioDataUri: string): Promise<string> {
    return await sttFlow({ audioDataUri });
}
