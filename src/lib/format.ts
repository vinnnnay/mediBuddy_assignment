const ACRONYMS = new Set([
  'OTC',
  'IV',
  'IM',
  'IU',
  'USP',
  'HCL',
  'ER',
  'XR',
  'SR',
  'DR',
  'PM',
  'AM',
])

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      const upper = word.toUpperCase()

      if (ACRONYMS.has(upper)) {
        return upper
      }

      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function formatList(values: string[], limit = 3): string | null {
  if (values.length === 0) {
    return null
  }

  const shown = values.slice(0, limit).map(toTitleCase)
  const remaining = values.length - shown.length

  return remaining > 0 ? `${shown.join(', ')} +${remaining} more` : shown.join(', ')
}
