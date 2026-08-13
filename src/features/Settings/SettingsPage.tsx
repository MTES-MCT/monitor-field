import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { ScrollView } from 'react-native-gesture-handler'
import { Linking, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { Spacing } from '@constants/theme'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'
import { LoaderIcon } from '@components/LoaderIcon'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import daysjs from 'dayjs'
import { useGlobalStyle } from '@globalStyle'

const MONITOR_EMAIL = process.env.EXPO_PUBLIC_EMAIL

type SettingsPageProps = {
  closeSettings: () => void
  openSeaFrontsSelector: () => void
  setIsRefreshingData: (value: boolean) => void
  refreshData: () => Promise<void>
}

export function SettingsPage({
  closeSettings,
  openSeaFrontsSelector,
  setIsRefreshingData,
  refreshData
}: SettingsPageProps) {
  const theme = useTheme()
  const globalStyle = useGlobalStyle()
  const [isRefreshingDataLocal, setIsRefreshingDataLocal] = useState(false)
  const [selectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)
  const [regulatoryAreasLastUpdate] = useMMKVString('regulatory-areas-last-update', storage)

  const formattedLastUpdateDate = daysjs(regulatoryAreasLastUpdate).format('DD/MM/YYYY à HH[h]mm')

  const refreshDataFromSettings = () => {
    setIsRefreshingDataLocal(true)
    setIsRefreshingData(true)
    refreshData().finally(() => {
      setIsRefreshingDataLocal(false)
    })
  }

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <ThemedText type="large">Paramètres</ThemedText>
        <CloseButton onClose={closeSettings} />
      </View>
      <ScrollView>
        <View style={styles.section}>
          <ThemedText type="small">Mise à jour des données</ThemedText>
          <ThemedText type="default">Les données sont mises à jour automatiquement chaque semaine</ThemedText>
          <Pressable
            onPress={refreshDataFromSettings}
            accessibilityRole="button"
            accessibilityState={{ disabled: isRefreshingDataLocal }}
            style={[styles.refreshButton, { borderColor: theme.lightGray }]}
            disabled={isRefreshingDataLocal}
          >
            {isRefreshingDataLocal ? (
              <LoaderIcon />
            ) : (
              <Image
                source={require('@assets/icons/recurring.svg')}
                style={{ height: 24, tintColor: theme.gunMetal, width: 24 }}
              />
            )}
            <ThemedText type="defaultSans">
              {isRefreshingDataLocal ? 'Mise à jour en cours...' : 'Mise à jour manuelle des données'}
            </ThemedText>
          </Pressable>
          <ThemedText themeColor="slateGray" type="small" style={styles.refreshDate}>
            Dernière mise à jour le {formattedLastUpdateDate}
          </ThemedText>
        </View>
        <View style={globalStyle.separator} />
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
            <View style={{ flex: 1 }}>
              <ThemedText type="default">Façades</ThemedText>
              <ThemedText type="small" themeColor="slateGray" style={{ flexWrap: 'wrap' }}>
                {selectedSeaFronts}
              </ThemedText>
            </View>
            <Image
              source={require('@assets/icons/chevron.svg')}
              style={[styles.chevronIcon, { tintColor: theme.slateGray }]}
            />
          </Pressable>
        </View>
        <View style={globalStyle.separator} />
        <View style={styles.section}>
          <ThemedText type="small">Retours de bugs et suggestions</ThemedText>
          <ThemedText type="default">
            Cette application est en phase de test. N’hésitez pas à nous faire des retours avec le bouton dédié.
          </ThemedText>
          <ThemedText type="default">
            Vous pouvez également nous contacter à l’adresse suivante : {'\n'}
            <ThemedText
              style={globalStyle.textUnderline}
              type="default"
              onPress={() => Linking.openURL(`mailto:${MONITOR_EMAIL}`)}
            >
              {MONITOR_EMAIL}
            </ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  chevronIcon: {
    height: 20,
    transform: [{ rotate: '180deg' }],
    width: 20
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.four
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
  }
})
