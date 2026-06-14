import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { photoDataUrl, description } = await req.json()

    if (!photoDataUrl && !description) {
      return new Response(JSON.stringify({ error: 'No input provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userContent: Anthropic.MessageParam['content'] = []

    if (photoDataUrl) {
      // Extract base64 data from data URL
      const base64Data = photoDataUrl.split(',')[1]
      const mediaTypeMatch = photoDataUrl.match(/data:([^;]+);/)
      const mediaType = (mediaTypeMatch?.[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp') ?? 'image/jpeg'

      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      })
    }

    const descriptionText = description
      ? `Food description: ${description}`
      : 'Please analyze the food in this image.'

    userContent.push({
      type: 'text',
      text: `${descriptionText}

Analyze this food and return ONLY a JSON object with these exact fields. Be realistic and accurate:
{
  "name": "brief descriptive name of the food/meal",
  "nutrition": {
    "calories": <number>,
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fat": <number in grams>,
    "fiber": <number in grams>,
    "sugar": <number in grams>,
    "sodium": <number in milligrams>,
    "saturatedFat": <number in grams>,
    "cholesterol": <number in milligrams>
  }
}

Return ONLY the JSON, no other text.`,
    })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: userContent }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Food analysis error:', error)
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        name: 'Unknown Food',
        nutrition: {
          calories: 300,
          protein: 15,
          carbs: 35,
          fat: 10,
          fiber: 3,
          sugar: 8,
          sodium: 400,
          saturatedFat: 3,
          cholesterol: 30,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
