// Frees the JS thread between synchronous processing chunks so pending touches/navigation can be handled.
export function yieldToMainThread(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}
