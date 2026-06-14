import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { age, sex, weightLbs, heightInches, activityLevel, fitnessGoal, targetWeightLbs } = body

    const weightKg = (weightLbs * 0.453592).toFixed(1)
    const heightCm = (heightInches * 2.54).toFixed(1)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Calculate optimal daily nutrition targets for this person:
- Age: ${age}
- Sex: ${sex}
- Weight: ${weightLbs} lbs (${weightKg} kg)
- Height: ${heightCm} cm
- Activity Level: ${activityLevel}
- Fitness Goal: ${fitnessGoal}
${targetWeightLbs ? `- Target Weight: ${targetWeightLbs} lbs` : ''}

Use Mifflin-St Jeor equation. Return ONLY a JSON object:
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>
}

Return ONLY the JSON, no other text.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])

    return new Response(
      JSON.stringify({ ...parsed, source: 'ai_generated' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Goal generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Generation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
