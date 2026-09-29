import { ThemedText } from '@components/Elements/Text'
import { hasOutdatedReference, type RegulatoryReference } from '@domain/entities/regulatoryAreas/FishRegulation'
import { useGlobalStyle } from '@globalStyle'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { styles } from '../style'

export function OutdatedReferencesWarning({ regulatoryReferences }: { regulatoryReferences: RegulatoryReference[] }) {
  const theme = useTheme()
  const globalStyle = useGlobalStyle()

  if (!hasOutdatedReference(regulatoryReferences, new Date())) {
    return null
  }

  return (
    <View style={[styles.warning, { backgroundColor: theme.goldenPoppy }]}>
      <Image source={require('@assets/icons/attention-filled.svg')} style={globalStyle.iconSmall} />
      <ThemedText type="smallBold" themeColor="gunMetal" style={{ flex: 1 }}>
        {`${regulatoryReferences.length === 1 ? 'La' : 'Une'} réglementation de cette zone n'est plus valide.`}
      </ThemedText>
    </View>
  )
}
