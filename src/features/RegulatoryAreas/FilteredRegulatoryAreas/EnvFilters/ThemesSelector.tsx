import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { ThemedText } from '@components/Elements/Text'
import { Checkbox } from '@components/Elements/Checkbox'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { useGlobalStyle } from '@globalStyle'
import { Image } from 'expo-image'
import { normalizeText } from '@utils/normalizeText'
import { LoaderIcon } from '@components/LoaderIcon'
import { useRegulatoryAreasLayer } from '@features/RegulatoryAreas/hooks/useRegulatoryAreasLayer'
import { getEnvThemesAndSubThemes } from '@features/RegulatoryAreas/useCases/getEnvThemesAndSubThemes'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SearchInput } from '@components/SearchInput'

type ThemesSelectorProps = {
  onShowResults: () => void
  filtersCount: number
}

export function ThemesSelector({ onShowResults, filtersCount }: ThemesSelectorProps) {
  const inputRef = useRef<TextInput | null>(null)
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const { filters, setFilters, totalCount } = useRegulatoryAreasContext()
  const { isLoading } = useRegulatoryAreasLayer()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({})
  const [themesBySubThemes, setThemesBySubThemes] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function fetchThemes() {
      const themes = await getEnvThemesAndSubThemes()

      setThemesBySubThemes(Object.fromEntries(themes.map(theme => [theme.name, theme.subThemes])))
    }

    fetchThemes()
  }, [])

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
  }, [searchQuery, themesBySubThemes])

  const toggleExpandedTheme = (themeName: string) => {
    setExpandedThemes(current => ({ ...current, [themeName]: !current[themeName] }))
  }

  const isThemeChecked = (themeName: string) => filters.themes.some(theme => theme.name === themeName)

  const toggleTheme = (themeName: string, subThemes: string[]) => {
    const isSelected = isThemeChecked(themeName)
    let themeFilterToUpdate = [...filters.themes]

    if (isSelected) {
      themeFilterToUpdate = themeFilterToUpdate.filter(theme => theme.name !== themeName)
    } else {
      themeFilterToUpdate.push({ name: themeName, subThemes })
    }

    setFilters(currentFilters => {
      return {
        ...currentFilters,
        themes: themeFilterToUpdate
      }
    })
  }

  const isSubThemeChecked = (themeName: string, subTheme: string) =>
    filters.themes
      .filter(theme => theme.name === themeName)
      .some(filteredTheme => filteredTheme.subThemes.includes(subTheme))

  const toggleSubTheme = (themeName: string, subTheme: string) => {
    const isSelected = isSubThemeChecked(themeName, subTheme)
    setFilters(currentFilters => {
      const themeToUpdate = currentFilters.themes.find(theme => theme.name === themeName)

      if (themeToUpdate) {
        if (isSelected) {
          themeToUpdate.subThemes = themeToUpdate.subThemes.filter(st => st !== subTheme)
        } else {
          themeToUpdate.subThemes.push(subTheme)
        }
      } else {
        currentFilters.themes.push({ name: themeName, subThemes: [subTheme] })
      }

      if (themeToUpdate && themeToUpdate.subThemes.length === 0) {
        currentFilters.themes = currentFilters.themes.filter(theme => theme.name !== themeName)
      }

      return {
        ...currentFilters,
        themes: [...currentFilters.themes]
      }
    })
  }

  const cleanFilters = () => {
    setFilters(currentFilters => ({
      ...currentFilters,
      themes: []
    }))
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchInput
        ref={inputRef}
        isLight={false}
        withBackButton={false}
        searchText={searchQuery}
        onChangeText={setSearchQuery}
        onClearText={() => setSearchQuery('')}
        style={{ flex: 0, marginHorizontal: Spacing.four }}
      />

      <ScrollView persistentScrollbar style={{ paddingHorizontal: Spacing.four }}>
        {filteredThemeEntries.map(([themeName, subThemes]) => {
          const isExpanded = expandedThemes[themeName] ?? false

          return (
            <View key={themeName} style={styles.themeWrapper}>
              <View style={styles.themeRow}>
                <Checkbox
                  label={themeName}
                  isChecked={isThemeChecked(themeName)}
                  onToggle={() => toggleTheme(themeName, subThemes)}
                  style={{
                    marginHorizontal: Spacing.four
                  }}
                  numberOfLines={1}
                />
                <Pressable onPress={() => toggleExpandedTheme(themeName)} hitSlop={28}>
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
      <View>
        <View style={globalStyle.separator}></View>
        <View style={styles.buttonsWrapper}>
          {filtersCount > 0 && (
            <Pressable
              onPress={cleanFilters}
              accessibilityRole="button"
              accessibilityState={{ disabled: false }}
              style={styles.button}
            >
              <ThemedText type="default">Effacer les filtres ({filtersCount})</ThemedText>
            </Pressable>
          )}
          <Pressable
            onPress={onShowResults}
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
            style={[styles.button, styles.showResultsButton]}
          >
            <ThemedText type="default" themeColor="white">
              Voir {totalCount ?? 0} résultat(s)
            </ThemedText>
            {isLoading && <LoaderIcon tintColor="white" size="SMALL" />}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
const createStyles = theme =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: Spacing.four,
      paddingVertical: Spacing.three
    },
    buttonsWrapper: {
      gap: Spacing.two,
      justifyContent: 'center',
      paddingHorizontal: Spacing.three
    },
    chevronIcon: {
      height: 20,
      marginLeft: Spacing.four,
      tintColor: theme.slateGray,
      transform: [{ rotate: '180deg' }],
      width: 20
    },
    chevronIconExpanded: {
      transform: [{ rotate: '270deg' }]
    },
    searchWrapper: {
      paddingVertical: Spacing.three
    },
    showResultsButton: {
      backgroundColor: theme.charcoal,
      flexDirection: 'row',
      gap: Spacing.two,
      marginBottom: Spacing.four
    },
    subThemeRow: {
      paddingLeft: Spacing.six,
      paddingRight: 60
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
