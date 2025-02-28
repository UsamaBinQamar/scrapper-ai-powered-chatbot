/**
 * Formats an array of messages into a conversation history string
 * Alternates between Human and AI prefixes based on array position
 *
 * @param messages - Array of message strings
 * @returns Formatted conversation history as a string
 */
export function formatConvHistory(messages: string[]): string {
  return messages
    .map((message, i) => {
      if (i % 2 === 0) {
        return `Human: ${message}`;
      } else {
        return `AI: ${message}`;
      }
    })
    .join("\n");
}
