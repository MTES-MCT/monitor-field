import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { useState } from 'react'
import { Step1 } from './Step1'
import { Step2 } from './Step2'
import { Step3 } from './Step3'

export function OnBoarding() {
  const theme = useTheme()

  const [currentStep, setCurrentStep] = useState<number | undefined>(1)
  return (
    <SafeAreaView style={[styles.wrapper, { backgroundColor: theme.gunMetal }]}>
      {currentStep === 1 && <Step1 setCurrentStep={() => setCurrentStep(2)} />}
      {currentStep === 2 && <Step2 setCurrentStep={() => setCurrentStep(3)} />}
      {currentStep === 3 && <Step3 />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
