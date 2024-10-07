import type { APIContext } from "astro";
import { makeRequest } from "../../../utils/makeRequest";
import { sendBadRequest, sendSuccessfulResponse } from "../../../utils/sendResponse";

export async function POST({ request }: APIContext) {
    const { channel, uid, clientId, credential } = await request.json()

    if (!channel) {
        return sendBadRequest("channel is required")
    }

    try {
        await makeRequest("POST", import.meta.env.AI_SERVER_URL + "/stop_agent", credential, JSON.stringify({
            channel_name: channel,
            uid: uid
        }), clientId);
    } catch (error) {
        console.error("Error stopping agent:", error);
        // Continue execution
    }


    return sendSuccessfulResponse({})
}