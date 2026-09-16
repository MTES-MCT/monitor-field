import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRegulatoryAreasLayer } from '@features/RegulatoryAreas/Layers/RegulatoryAreasLayers'
import { ThemedText } from '@components/Elements/Text'
import { Checkbox } from '@components/Elements/Checkbox'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useMemo, useState } from 'react'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { normalizeText } from '@utils/normalizeText'
import { SearchThemes } from './SearchThemes'
import { LoaderIcon } from '@components/LoaderIcon'

// TODO: replace with real data fetched from getEnvThemesAndSubThemes
const themes = [
  {
    'AMP sans réglementation particulière particulière': ['sous-theme 1', 'sous-theme 2'],
    'Arrêté de protection': ['sous-theme 1', 'sous-theme 2'],
    'Arrêté à visa environnemental': ['sous-theme 1', 'sous-theme 2'],
    'Bien culturel maritime': ['sous-theme 1', 'sous-theme 2', 'sous-theme 3'],
    'Culture marine': ['sous-theme 1', 'sous-theme 2'],
    'Pêche à pied': ['sous-theme 1', 'sous-theme 2'],
    'Réserve naturelle': ['sous-theme 1', 'sous-theme 2'],
    'Site naturel protégé': ['sous-theme 1', 'sous-theme 2'],
    'Zone de protection spéciale': ['sous-theme 1', 'sous-theme 2'],
    'Zone humide': ['sous-theme 1', 'sous-theme 2'],
    'Zone marine protégée': ['sous-theme 1', 'sous-theme 2']
  }
]

const themesBySubThemes: Record<string, string[]> = themes[0] ?? {}

function getSubThemeKey(theme: string, subTheme: string) {
  return `${theme}::${subTheme}`
}

export function ThemesSelector() {
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const { filters, setFilters, totalCount } = useRegulatoryAreasContext()
  const { isLoading } = useRegulatoryAreasLayer()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({})

  const filteredThemeEntries = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery.trim())

    return Object.entries(themesBySubThemes).filter(([themeName, subThemes]) => {
      if (!normalizedQuery) {
        return true
      }
      return (
        normalizeText(themeName).includes(normalizedQuery) ||
        subThemes.some(subTheme => normalizeText(subTheme).includes(normalizedQuery))
      )
    })
  }, [searchQuery])

  const toggleExpandedTheme = (themeName: string) => {
    setExpandedThemes(current => ({ ...current, [themeName]: !current[themeName] }))
  }

  const isThemeChecked = (themeName: string) => filters.themesAndSubThemes.includes(themeName)

  const isSubThemeChecked = (themeName: string, subTheme: string) =>
    filters.themesAndSubThemes.includes(getSubThemeKey(themeName, subTheme))

  const toggleTheme = (themeName: string) => {
    const subThemes = themesBySubThemes[themeName] ?? []
    const subThemeKeys = subThemes.map(subTheme => getSubThemeKey(themeName, subTheme))
    const shouldSelect = !isThemeChecked(themeName)

    setFilters(currentFilters => {
      const withoutTheme = currentFilters.themesAndSubThemes.filter(
        value => value !== themeName && !subThemeKeys.includes(value)
      )

      return {
        ...currentFilters,
        themesAndSubThemes: shouldSelect ? [...withoutTheme, themeName, ...subThemeKeys] : withoutTheme
      }
    })
  }

  const toggleSubTheme = (themeName: string, subTheme: string) => {
    const subThemes = themesBySubThemes[themeName] ?? []
    const subThemeKey = getSubThemeKey(themeName, subTheme)

    setFilters(currentFilters => {
      const isSelected = currentFilters.themesAndSubThemes.includes(subThemeKey)
      const otherSubThemeKeys = currentFilters.themesAndSubThemes.filter(
        value => value !== subThemeKey && value !== themeName && value.startsWith(`${themeName}::`)
      )
      const nextSubThemeKeys = isSelected ? otherSubThemeKeys : [...otherSubThemeKeys, subThemeKey]
      const areAllSubThemesSelected = subThemes.every(currentSubTheme =>
        nextSubThemeKeys.includes(getSubThemeKey(themeName, currentSubTheme))
      )
      const withoutThemeAndSubThemes = currentFilters.themesAndSubThemes.filter(
        value => value !== themeName && !value.startsWith(`${themeName}::`)
      )

      return {
        ...currentFilters,
        themesAndSubThemes: areAllSubThemesSelected
          ? [...withoutThemeAndSubThemes, themeName, ...nextSubThemeKeys]
          : [...withoutThemeAndSubThemes, ...nextSubThemeKeys]
      }
    })
  }

  return (
    <>
      <View style={styles.searchWrapper}>
        <SearchThemes value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <ScrollView>
        {filteredThemeEntries.map(([themeName, subThemes]) => {
          const isExpanded = expandedThemes[themeName] ?? false

          return (
            <View key={themeName} style={styles.themeWrapper}>
              <View style={styles.themeRow}>
                <Checkbox
                  label={themeName}
                  isChecked={isThemeChecked(themeName)}
                  onToggle={() => toggleTheme(themeName)}
                  style={{
                    marginHorizontal: Spacing.four
                  }}
                  numberOfLines={1}
                />
                <Pressable onPress={() => toggleExpandedTheme(themeName)} hitSlop={18}>
                  <Image
                    source={require('@assets/icons/chevron.svg')}
                    style={[styles.chevronIcon, isExpanded && styles.chevronIconExpanded]}
                  />
                </Pressable>
              </View>

              {isExpanded &&
                subThemes.map(subTheme => (
                  <View key={subTheme} style={styles.subThemeRow}>
                    <Checkbox
                      label={subTheme}
                      isChecked={isSubThemeChecked(themeName, subTheme)}
                      onToggle={() => toggleSubTheme(themeName, subTheme)}
                      numberOfLines={1}
                    />
                  </View>
                ))}
            </View>
          )
        })}
      </ScrollView>
      <View style={globalStyle.separator}></View>
      <Pressable
        onPress={() => {}}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        style={styles.showResultsButton}
      >
        <ThemedText type="default" themeColor="white">
          Voir {totalCount ?? 0} résultat(s)
        </ThemedText>
        {isLoading && <LoaderIcon tintColor="white" size="SMALL" />}
      </Pressable>
    </>
  )
}
const createStyles = theme =>
  StyleSheet.create({
    chevronIcon: {
      height: 20,
      marginHorizontal: Spacing.four,
      tintColor: theme.slateGray,
      transform: [{ rotate: '180deg' }],
      width: 20
    },
    chevronIconExpanded: {
      transform: [{ rotate: '270deg' }]
    },
    searchWrapper: {
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three
    },
    showResultsButton: {
      alignItems: 'center',
      backgroundColor: theme.charcoal,
      flexDirection: 'row',
      gap: Spacing.two,
      justifyContent: 'center',
      marginBottom: Spacing.four,
      marginHorizontal: Spacing.four,
      paddingVertical: Spacing.four
    },
    subThemeRow: {
      marginLeft: Spacing.six
    },
    themeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    themeWrapper: {
      borderBottomWidth: 1,
      borderColor: theme.lightGray
    }
  })
