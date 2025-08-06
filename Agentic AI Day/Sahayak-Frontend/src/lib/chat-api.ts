
'use server';

import { generateSpeech } from "@/ai/flows/tts-flow";
import { transcribeAudio } from "@/ai/flows/stt-flow";

// These URLs are loaded from environment variables. See .env file for values.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL!;


async function request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    return response.json();
}

export const getSessions = async (userId: string) => {
    return request(`/get_sessions?user_id=${userId}`);
};

export const createSession = async (userId: string) => {
    return request(`/create_session?user_id=${userId}`, { method: 'POST' });
};

export const deleteSession = async (userId: string, sessionId: string) => {
    return request(`/delete_session?user_id=${userId}&session_id=${sessionId}`, { method: 'DELETE' });
};

export const getSessionMessages = async (userId: string, sessionId: string) => {
    return request(`/get_session_message?user_id=${userId}&session_id=${sessionId}`);
};

export const uploadFile = async (userId: string, sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('session_id', sessionId);
    formData.append('file', file);

    const url = `${UPLOAD_BASE_URL}/upload_file`;
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`File upload failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    return response.json();
};


interface GetAnswerParams {
    user_id: string;
    session_id: string;
    message: string;
    attachment_filename?: string;
    target_grade_list: number[];
    response_tone: string;
    complexity: string;
}

export const getAnswer = async (params: GetAnswerParams) => {
    return request(`/get_answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
};

export const getAudioForText = async (text: string) => {
    return await generateSpeech(text);
};

export const getTextForAudio = async (audioDataUri: string) => {
    return await transcribeAudio(audioDataUri);
};
