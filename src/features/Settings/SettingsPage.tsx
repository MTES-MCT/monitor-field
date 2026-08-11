import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { Linking, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'

export function SettingsPage({
  closeSettings,
  openSeaFrontsSelector
}: {
  closeSettings: () => void
  openSeaFrontsSelector: () => void
}) {
  const theme = useTheme()
  const [selectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)

  const refreshData = () => {
    // Logic to refresh data goes here
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.white }]}>
      <View style={styles.header}>
        <ThemedText type="default">Paramètres</ThemedText>
        <CloseButton onClose={closeSettings} />
      </View>
      <View style={styles.section}>
        <ThemedText type="small">Mise à jour des données</ThemedText>
        <ThemedText type="default">Les données sont mises à jour automatiquement chaque semaine</ThemedText>
        <Pressable
          onPress={refreshData}
          accessibilityRole="button"
          accessibilityState={{ disabled: false }}
          style={[styles.refreshButton, { borderColor: theme.lightGray }]}
        >
          <Image
            source={require('@assets/icons/recurring.svg')}
            style={{ height: 24, tintColor: theme.gunMetal, width: 24 }}
          />
          <ThemedText type="defaultSans">Mise à jour manuelle des données</ThemedText>
        </Pressable>
        <ThemedText themeColor="slateGray" type="small" style={styles.refreshDate}>
          Dernière mise à jour le XX/XX/XXXX à XXhXX
        </ThemedText>
      </View>
      <View style={[styles.separator, { backgroundColor: theme.lightGray }]} />
      <View style={styles.section}>
        <ThemedText type="small">Secteur de téléchargement des zones</ThemedText>
        <ThemedText type="default">
          Les réglementations ne pourront être chargées sur la carte que dans le(s) secteur(s) choisi
        </ThemedText>
        <Pressable
          onPress={openSeaFrontsSelector}
          accessibilityRole="button"
          accessibilityState={{ disabled: false }}
          style={[styles.seaFrontsSelector, { borderColor: theme.lightGray }]}
        >
          <View style={{}}>
            <ThemedText type="default">Façades</ThemedText>
            <ThemedText type="small" themeColor="slateGray">
              {selectedSeaFronts}
            </ThemedText>
          </View>
          <Image
            source={require('@assets/icons/chevron.svg')}
            style={{ height: 20, tintColor: theme.slateGray, transform: [{ rotate: '180deg' }], width: 20 }}
          />
        </Pressable>
      </View>
      <View style={[styles.separator, { backgroundColor: theme.lightGray }]} />
      <View style={styles.section}>
        <ThemedText type="small">Retours de bugs et suggestions</ThemedText>
        <ThemedText type="default">
          Cette application est en phase de test. N’hésitez pas à nous faire des retours avec le bouton dédié.
        </ThemedText>
        <ThemedText type="default">
          Vous pouvez également nous contacter à l’adresse suivante : {'\n'}
          <ThemedText
            style={styles.textUnderline}
            type="default"
            onPress={() => Linking.openURL('mailto:monitor.beta.gouv@gmail.com')}
          >
            monitor.beta.gouv@gmail.com
          </ThemedText>
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  refreshButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two
  },
  refreshDate: {
    fontStyle: 'italic'
  },
  seaFrontsSelector: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two
  },
  seaFrontsSelectorText: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: Spacing.two,
    justifyContent: 'space-between',
    marginLeft: Spacing.two
  },
  section: {
    gap: Spacing.two,
    padding: Spacing.four
  },
  separator: {
    height: 1
  },
  textUnderline: {
    textDecorationLine: 'underline'
  },
  wrapper: {
    flex: 1,
    paddingBottom: Spacing.four
  }
})
