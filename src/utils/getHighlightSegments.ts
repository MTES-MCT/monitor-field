import { normalizeText } from './normalizeText'

export type HighlightSegment = {
  highlighted: boolean
  text: string
}

// Splits `text` into segments, flagging the parts matching one of the words of `searchQuery`.
// Matching is case and accent insensitive, consistent with `matchesSearchQuery`.
export function getHighlightSegments(text: string, searchQuery: string | undefined): HighlightSegment[] {
  const words = toSearchWords(searchQuery)
  if (!text || words.length === 0) {
    return [{ highlighted: false, text }]
  }

  // Normalize char by char to keep a mapping between normalized and original indexes
  let normalized = ''
  const originalIndexes: number[] = []
  for (let index = 0; index < text.length; index += 1) {
    const normalizedChar = normalizeText(text.charAt(index))
    normalized += normalizedChar
    for (let charIndex = 0; charIndex < normalizedChar.length; charIndex += 1) {
      originalIndexes.push(index)
    }
  }

  const isHighlighted = new Array<boolean>(text.length).fill(false)
  for (const word of words) {
    let start = normalized.indexOf(word)
    while (start !== -1) {
      const originalStart = originalIndexes[start] ?? 0
      const originalEnd = originalIndexes[start + word.length - 1] ?? originalStart
      isHighlighted.fill(true, originalStart, originalEnd + 1)
      start = normalized.indexOf(word, start + word.length)
    }
  }

  const segments: HighlightSegment[] = []
  for (let index = 0; index < text.length; index += 1) {
    const char = text.charAt(index)
    const highlighted = isHighlighted[index] ?? false
    const lastSegment = segments.at(-1)
    if (lastSegment && lastSegment.highlighted === highlighted) {
      lastSegment.text += char
    } else {
      segments.push({ highlighted, text: char })
    }
  }

  return segments
}

function toSearchWords(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}
