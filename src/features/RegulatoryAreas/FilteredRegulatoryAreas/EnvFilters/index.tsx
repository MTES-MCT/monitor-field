import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { Switch } from '@components/Elements/Switch'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'

export function EnvFilters() {
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const { filters, setFilters, totalCount } = useRegulatoryAreasContext()
  const [isOpen, setIsOpen] = useState(false)
  const closeEnvFilters = () => setIsOpen(false)

  const filtersCount = filters.themesAndSubThemes.length + (filters.recentlyAddedOrModified ? 1 : 0)

  const onSwitch = () => {
    setFilters(currentFilters => ({
      ...currentFilters,
      recentlyAddedOrModified: !currentFilters.recentlyAddedOrModified
    }))
  }
  const cleanFilters = () => {
    setFilters({
      ...filters,
      recentlyAddedOrModified: false,
      themesAndSubThemes: []
    })
  }
  const openThemesFilterSelector = () => {}

  const consultResults = () => setIsOpen(false)

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityState={{
          disabled: false
        }}
        style={styles.buttonBase}
      >
        {filtersCount > 0 && (
          <View style={globalStyle.dot}>
            <ThemedText type="small" themeColor="white">
              {filtersCount}
            </ThemedText>
          </View>
        )}
        <Image source={require('@assets/icons/filter.svg')} style={globalStyle.iconNormal} />
      </Pressable>

      <Modal transparent visible={isOpen} animationType="slide" onRequestClose={closeEnvFilters}>
        <View style={globalStyle.modalContainer}>
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
                <ThemedText type="default">Thématiques et sous them.</ThemedText>
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
      </Modal>
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    buttonBase: {
      backgroundColor: theme.white,
      flexDirection: 'row',
      justifyContent: 'center',
      padding: Spacing.three,
      position: 'relative',
      zIndex: -1
    },
    buttonsWrapper: {
      gap: Spacing.two,
      justifyContent: 'center',
      paddingHorizontal: Spacing.three
    },
    chevronIcon: {
      height: 20,
      tintColor: theme.slateGray,
      transform: [{ rotate: '180deg' }],
      width: 20
    },
    filterRow: {
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: theme.lightGray,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: Spacing.four,
      paddingVertical: Spacing.four
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: Spacing.four
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: theme.charcoal,
      justifyContent: 'center',
      paddingHorizontal: Spacing.six,
      paddingVertical: Spacing.four
    },
    transparentButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: Spacing.six,
      paddingVertical: Spacing.four
    }
  })
