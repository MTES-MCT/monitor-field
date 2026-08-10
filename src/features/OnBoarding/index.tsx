import { syncRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreasDB'
import { storage } from '@storage'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/use-theme'
import { Step1 } from './Step1'
import { Step2 } from './Step2'
import { Step3 } from './Step3'

export function OnBoarding() {
  const theme = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [syncPromise, setSyncPromise] = useState<Promise<void> | null>(null)

  const handleStep2Next = (facades: string[]) => {
    storage.set('selectedSeaFronts', facades.join(','))
    setSyncPromise(syncRegulatoryAreasDB(facades))
    setCurrentStep(3)
  }

  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.gunMetal }]}>
      {currentStep === 1 && <Step1 setCurrentStep={() => setCurrentStep(2)} />}
      {currentStep === 2 && <Step2 onNext={handleStep2Next} />}
      {currentStep === 3 && syncPromise && <Step3 syncPromise={syncPromise} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
