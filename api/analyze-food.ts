import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const client = new Anthropic()

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  try {
    const { photoDataUrl, description } = req.body

    if (!photoDataUrl && !description) {
      res.status(400).json({ error: 'No input provided' })
      return
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

    res.status(200).json(parsed)
  } catch (error) {
    console.error('Food analysis error:', error)
    res.status(200).json({
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
    })
  }
}
