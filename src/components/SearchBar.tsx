import { CloseButton, Loader, TextInput } from '@mantine/core'

type SearchBarProps = {
  value: string
  busy: boolean
  onChange: (value: string) => void
}

function SearchIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx={11} cy={11} r={7} />
      <line x1={16.5} y1={16.5} x2={21} y2={21} />
    </svg>
  )
}

export default function SearchBar({ value, busy, onChange }: SearchBarProps) {
  return (
    <TextInput
      size="md"
      type="search"
      value={value}
      placeholder="Search by brand name, e.g. Advil"
      aria-label="Search medicines by brand name"
      autoComplete="off"
      onChange={(event) => onChange(event.currentTarget.value)}
      leftSection={<SearchIcon />}
      rightSection={
        busy ? (
          <Loader size="xs" />
        ) : value ? (
          <CloseButton
            aria-label="Clear search"
            onClick={() => onChange('')}
          />
        ) : null
      }
    />
  )
}
