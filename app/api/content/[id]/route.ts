import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { cookiesClient } from "@/utils/amplify-utils";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const contentId = params.id;
    console.log('contentId: ' + contentId);

    const body = await request.json();
    const content_model = body.content_model;
    console.log("model input: " + body.model_input);

    // call Replicate API
    let model_input = body.model_input;
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    let prediction = await replicate.predictions.create({ model: content_model, input: JSON.parse(model_input), webhook: process.env.NEXT_PUBLIC_CALLBACK_HOST + '/callback/replicate', webhook_events_filter: ['completed'] });
    console.log("prediction: " + JSON.stringify(prediction));
    const { data: updatedContent, errors } = await cookiesClient.models.Content.update({
        id: contentId,
        generation_id: prediction.id,
    });
    return NextResponse.json({ status: 200 });
};