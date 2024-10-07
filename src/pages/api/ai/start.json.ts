import type { APIContext } from "astro";
import { generateCredential } from "../../../utils/generateCredential";
import { makeRequest } from "../../../utils/makeRequest";
import { sendBadRequest, sendSuccessfulResponse } from "../../../utils/sendResponse";

export async function POST({ request }: APIContext) {
    const { channel, uid } = await request.json()

    if (!channel) {
        return sendBadRequest("channel is required")
    }
    if (!uid) {
        return sendBadRequest("uid is required")
    }

    const credential = generateCredential()

    const res = await makeRequest("POST", import.meta.env.AI_SERVER_URL + "/start_agent", credential, JSON.stringify({
        channel_name: channel,
        uid: uid
    }))

    console.log(res)

    const responseData = await res.json();
    return sendSuccessfulResponse({
        ...responseData,
        credential: credential
    });
}