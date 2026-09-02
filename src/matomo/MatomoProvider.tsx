import { createContext } from 'react'

export const MatomoContext = createContext<
  | {
      instance: any
    }
  | undefined
>(undefined)

export default function MatomoProvider({ instance, children }: { instance: any; children: React.ReactNode }) {
  return <MatomoContext.Provider value={{ instance }}>{children}</MatomoContext.Provider>
}
