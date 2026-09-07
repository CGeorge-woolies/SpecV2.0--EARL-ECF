import { useState } from 'react'

export interface EditableField<T> {
  value: T
  setValue: (value: T) => void
  isDirty: boolean
  /** Promotes the current value to the saved baseline. */
  commit: () => void
  /** Resets the current value back to the saved baseline. */
  revert: () => void
}

/** Tracks an editable value alongside its last-saved baseline, for per-field dirty state and save/discard. */
export function useEditableField<T>(initial: T): EditableField<T> {
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(initial)

  return {
    value,
    setValue,
    isDirty: value !== saved,
    commit: () => setSaved(value),
    revert: () => setValue(saved),
  }
}
