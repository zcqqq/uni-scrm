export default function verify_webhook(jsonBody) {
    const response = {
        statusCode: 200,
        isBase64Encoded: false,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'challenge': jsonBody.content.challenge }),
    };
    console.log('Response:', response.body);
    return response;
}