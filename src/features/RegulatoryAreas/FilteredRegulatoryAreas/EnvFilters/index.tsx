import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
// import { Switch } from '@components/Elements/Switch'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { Image } from 'expo-image'
import { useMemo, useState } from 'react'
import { Modal, Pressable, View, StyleSheet } from 'react-native'
import { useGlobalStyle } from '@globalStyle'
import { useTheme } from '@hooks/use-theme'
import { useAppContext } from '@contexts/AppContext'
import { ThemesSelector } from './ThemesSelector'
import { useBackHandler } from '@hooks/useBackHandler'

export function EnvFilters() {
  const globalStyle = useGlobalStyle()
  const theme = useTheme()
  const styles = createStyles(theme)
  const { filters } = useRegulatoryAreasContext()
  const { activeModal, setWithOverlay } = useAppContext()

  // const [isOpen, setIsOpen] = useState(false)
  const [isThemesSelectorOpen, setIsThemesSelectorOpen] = useState(false)
  // const closeEnvFilters = () => setIsOpen(false)
  const closeThemesSelector = () => {
    setIsThemesSelectorOpen(false)
    setWithOverlay(false)
  }

  const filtersCount = useMemo(
    () => filters.themes.length + filters.themes.flatMap(theme => theme.subThemes).length,
    [filters.themes]
  )

  /* const onSwitch = () => {
    setFilters(currentFilters => ({
      ...currentFilters,
      recentlyAddedOrModified: !currentFilters.recentlyAddedOrModified
    }))
  }

  const cleanFilters = () => {
    setFilters({
      ...filters,
      recentlyAddedOrModified: false,
      themes: []
    })
  } 



  const consultResults = () => setIsOpen(false)*/

  const openThemesFilterSelector = () => {
    setIsThemesSelectorOpen(true)
    setWithOverlay(true)
  }

  useBackHandler(closeThemesSelector, isThemesSelectorOpen)

  const borderStyle = useMemo(() => {
    if (activeModal && activeModal === 'REGULATORY_AREAS_LIST_MODAL') {
      return {
        borderColor: theme.lightGray,
        borderWidth: 1,
        boxShadow: 'inherit'
      }
    }
    return {}
  }, [activeModal, theme.lightGray])

  return (
    <>
      <Pressable
        onPress={openThemesFilterSelector}
        accessibilityRole="button"
        accessibilityState={{
          disabled: false
        }}
        style={[
          globalStyle.squareButton,
          {
            backgroundColor: theme.white,
            ...borderStyle
          }
        ]}
      >
        {filtersCount > 0 && (
          <View style={[globalStyle.dot]}>
            <ThemedText type="small" themeColor="white">
              {filtersCount}
            </ThemedText>
          </View>
        )}
        <Image source={require('@assets/icons/filter.svg')} style={globalStyle.iconNormal} />
      </Pressable>

      {/*       
      Commented this for beta test
      <Modal transparent visible={isOpen} animationType="slide" onRequestClose={closeEnvFilters}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <ThemedText type="large">Filtres</ThemedText>
              <CloseButton onClose={closeEnvFilters} />
            </View>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
              <View>
                <View style={styles.filterRow}>
                  <ThemedText type="default">Ajoutées / modifiées récemment</ThemedText>
                  <Switch isOn={filters.recentlyAddedOrModified} onSwitch={onSwitch} />
                </View>

                <Pressable
                  onPress={openThemesFilterSelector}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: false }}
                  style={styles.filterRow}
                >
                  <ThemedText type="default">Thématiques et sous-thématiques</ThemedText>
                  <Image source={require('@assets/icons/chevron.svg')} style={styles.chevronIcon} />
                </Pressable>
              </View>
              <View>
                <View style={globalStyle.separator}></View>
                <View style={styles.buttonsWrapper}>
                  <Pressable
                    onPress={cleanFilters}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: false }}
                    style={styles.transparentButton}
                  >
                    <ThemedText type="default">Effacer les filtres ({filtersCount})</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={consultResults}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: false }}
                    style={styles.primaryButton}
                  >
                    <ThemedText type="default" themeColor="white">
                      Voir {totalCount ?? 0} résultat(s)
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal> */}

      <Modal transparent visible={isThemesSelectorOpen} animationType="slide" onRequestClose={closeThemesSelector}>
        <View style={styles.modalContainer}>
          <View style={globalStyle.pageHeader}>
            <ThemedText type="large">Thématiques</ThemedText>
            <CloseButton onClose={closeThemesSelector} />
          </View>
          <ThemesSelector onShowResults={closeThemesSelector} filtersCount={filtersCount} />
        </View>
      </Modal>
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: theme.white,
      flex: 1,
      marginTop: 80
    }
  })
