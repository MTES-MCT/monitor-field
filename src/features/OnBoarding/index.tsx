import { syncRegulatoryAreasDB } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreasDB'
import { storage } from '@storage'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Step1 } from './Step1'
import { Step2 } from './Step2'
import { Step3 } from './Step3'
import { useThemedStyles } from '@hooks/use-themed-styles'

export function OnBoarding() {
  const styles = useThemedStyles(createStyles)
  const [currentStep, setCurrentStep] = useState(1)
  const [syncPromise, setSyncPromise] = useState<Promise<void> | null>(null)

  const handleStep2Next = (facades: string[]) => {
    storage.set('selectedSeaFronts', facades.join(','))
    setSyncPromise(syncRegulatoryAreasDB(facades))
    setCurrentStep(3)
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      {currentStep === 1 && <Step1 setCurrentStep={() => setCurrentStep(2)} />}
      {currentStep === 2 && <Step2 onNext={handleStep2Next} />}
      {currentStep === 3 && syncPromise && <Step3 syncPromise={syncPromise} />}
    </SafeAreaView>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.gunMetal,
      flex: 1
    }
  })
