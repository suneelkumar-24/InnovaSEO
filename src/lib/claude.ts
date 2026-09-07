import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

export async function generateWithClaude(prompt: string, modelName: string = 'claude-sonnet-5'): Promise<string> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is not configured in .env.local');
  }

  const message = await anthropic.messages.create({
    model: modelName,
    max_tokens: 1500,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  const contentBlock = message.content[0];
  if (contentBlock && contentBlock.type === 'text') {
    return contentBlock.text;
  }
  return '';
}
