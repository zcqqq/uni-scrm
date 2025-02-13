import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { cookiesClient } from "@/utils/amplify-utils";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const contentId = params.id;
    const body = await request.json();

    const getModelResponse = await fetch("https://api.replicate.com/v1/models/" + body.content_model, { headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` } });
    const model = await getModelResponse.json();
    console.log("model response: " + JSON.stringify(model));
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: model.latest_version.id,
            input: body.model_input,
            webhook: process.env.NEXT_PUBLIC_CALLBACK_HOST + '/callback/replicate',
            webhook_events_filter: ['completed']
        })
    };
    console.log("prediction requestOptions: " + JSON.stringify(requestOptions));

    const response = await fetch("https://api.replicate.com/v1/predictions", requestOptions);
    const prediction = await response.json();
    console.log("prediction response: " + JSON.stringify(prediction));

    const { data: updatedContent, errors } = await cookiesClient.models.Content.update({
        id: contentId,
        generation_id: prediction.id,
    });
    return NextResponse.json({ status: 200 });
};