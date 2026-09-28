import { Image } from 'expo-image'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useState } from 'react'
import * as Linking from 'expo-linking'

import { LoaderIcon } from '@components/LoaderIcon'
import { parseSeaFronts } from '@utils/parseSeaFronts'
import { useMMKVString } from 'react-native-mmkv'
import { storage } from '@storage'
import { syncRegulatoryAreas } from '@features/RegulatoryAreas/useCases/syncRegulatoryAreas'

import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { Link, useRouter } from 'expo-router'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { CloseButton } from '@components/Buttons/CloseButton'
import { useGlobalStyle } from '@globalStyle'
import daysjs from 'dayjs'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppContext } from '@contexts/AppContext'

const MONITOR_EMAIL = process.env.EXPO_PUBLIC_EMAIL

export default function Settings() {
  const router = useRouter()
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const { isRefreshingSettingsData, setIsRefreshingSettingsData } = useAppContext()

  const [isRefreshingDataLocal, setIsRefreshingDataLocal] = useState(false)
  const [selectedSeaFronts] = useMMKVString('selectedSeaFronts', storage)
  const [fishLastUpdate] = useMMKVString('fish-regulatory-areas-last-update', storage)
  const [envLastUpdate] = useMMKVString('env-regulatory-areas-last-update', storage)

  // Each dataset syncs on its own schedule, so the honest "last updated" is the older one.
  const oldestLastUpdate = [fishLastUpdate, envLastUpdate]
    .filter((value): value is string => !!value)
    .map(value => daysjs(value))
    .filter(date => date.isValid())
    .sort((a, b) => a.valueOf() - b.valueOf())[0]

  const formattedLastUpdateDate = oldestLastUpdate?.format('DD/MM/YYYY à HH[h]mm')

  const isRefreshing = isRefreshingDataLocal || isRefreshingSettingsData

  const refreshDataFromSettings = () => {
    setIsRefreshingDataLocal(true)
    setIsRefreshingSettingsData(true)
    refreshData().finally(() => {
      setIsRefreshingDataLocal(false)
    })
  }

  const refreshData = async () => {
    if (isRefreshingSettingsData) {
      return
    }

    const seaFronts = parseSeaFronts(selectedSeaFronts)

    setIsRefreshingSettingsData(true)
    try {
      await syncRegulatoryAreas(seaFronts, { forceRefresh: true })
    } finally {
      setIsRefreshingSettingsData(false)
    }
  }

  const closeSettings = () => {
    router.back()
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={globalStyle.pageHeader}>
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
            accessibilityState={{ disabled: isRefreshing }}
            style={styles.refreshButton}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <LoaderIcon />
            ) : (
              <Image
                source={require('@assets/icons/recurring.svg')}
                style={[globalStyle.iconNormal, styles.recurringIcon]}
              />
            )}
            <ThemedText type="defaultSans">
              {isRefreshing ? 'Mise à jour en cours...' : 'Mettre à jour maintenant'}
            </ThemedText>
          </Pressable>
          <ThemedText themeColor="slateGray" type="small" style={styles.refreshDate}>
            {formattedLastUpdateDate ? `Dernière mise à jour le ${formattedLastUpdateDate}` : 'Jamais mis à jour'}
          </ThemedText>
        </View>
        <View style={globalStyle.separator} />
        <View style={styles.section}>
          <ThemedText type="small">Secteur de téléchargement des zones</ThemedText>
          <ThemedText type="default">
            Les réglementations ne pourront être chargées sur la carte que dans le(s) secteur(s) choisi
          </ThemedText>
          <Link href="/settings/sea-fronts" asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityState={{ disabled: false }}
              style={styles.seaFrontsSelector}
            >
              <View style={{ flex: 1 }}>
                <ThemedText type="default">Façades</ThemedText>
                <ThemedText type="small" themeColor="slateGray" style={{ flexWrap: 'wrap' }}>
                  {selectedSeaFronts}
                </ThemedText>
              </View>
              <Image
                source={require('@assets/icons/chevron.svg')}
                style={[styles.chevronIcon, globalStyle.iconSmall]}
              />
            </Pressable>
          </Link>
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

const createStyles = theme =>
  StyleSheet.create({
    chevronIcon: {
      tintColor: theme.slateGray,
      transform: [{ rotate: '180deg' }]
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: Spacing.four
    },
    recurringIcon: {
      tintColor: theme.gunMetal
    },
    refreshButton: {
      alignItems: 'center',
      borderColor: theme.lightGray,
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
      borderColor: theme.lightGray,
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
