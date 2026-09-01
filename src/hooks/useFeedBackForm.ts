import { sendFeedback } from '@features/UserFeedback/sendFeedbacks'
import { useState } from 'react'

type Statut = 'idle' | 'sending' | 'success' | 'error'

export function useFeedbackForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'bug' | 'suggestion'>('bug')
  const [statut, setStatut] = useState<Statut>('idle')

  const canSend = title.trim().length > 0 && description.trim().length > 0

  async function submitFeedback() {
    if (!canSend || statut === 'sending') return
    setStatut('sending')
    try {
      await sendFeedback({ description, title, type })
      setStatut('success')
      setTitle('')
      setDescription('')
      setType('bug')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      setStatut('error')
    }
  }

  function reset() {
    setStatut('idle')
  }

  return { canSend, description, reset, setDescription, setTitle, setType, statut, submitFeedback, title, type }
}
