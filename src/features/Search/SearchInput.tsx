import { BackButton } from '@components/Buttons/BackButton'
import { CloseButton } from '@components/Buttons/CloseButton'
import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useAppContext } from '@contexts/AppContext'
import { useCameraContext } from '@contexts/CameraContext'
import { useGlobalStyle } from '@globalStyle'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { Image } from 'expo-image'
import { useCallback, useRef, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'

type SearchInputProps = {
  onClose: () => void
}

export function SearchInput({ onClose }: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<TextInput>(null)
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const { zoomToBbox } = useCameraContext()
  const { filters, setFilters, committedSearchBbox, committedSearchZoom } = useRegulatoryAreasContext()
  const { setActiveModal } = useAppContext()
  const [text, setText] = useState(filters.searchQuery ?? '')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const onChangeText = (newText: string) => {
    setText(newText)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setFilters(currentFilters => ({
        ...currentFilters,
        searchQuery: newText.trim() ? newText.trim() : undefined
      }))
    }, 300)
  }

  const onCloseSearchInput = () => {
    inputRef.current?.blur()
    onClose()
  }

  const onSubmit = useCallback(() => {
    router.navigate('/')
    setActiveModal('REGULATORY_AREAS_LIST_MODAL')

    setTimeout(() => {
      if (committedSearchBbox) {
        const centerLat = (committedSearchBbox.minLat + committedSearchBbox.maxLat) / 2
        const centerLon = (committedSearchBbox.minLon + committedSearchBbox.maxLon) / 2
        zoomToBbox({
          centerLat,
          centerLon,
          withPadding: true,
          zoom: committedSearchZoom ? committedSearchZoom * 0.8 : undefined
        })
      }
    }, 1000)
  }, [setActiveModal, router, committedSearchBbox, committedSearchZoom, zoomToBbox])

  return (
    <>
      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.three }}>
        <View style={styles.searchBox}>
          <BackButton onBack={onCloseSearchInput} style={{ marginLeft: Spacing.two }} />

          <TextInput
            ref={inputRef}
            autoFocus
            style={styles.input}
            value={text}
            onChangeText={onChangeText}
            placeholder="Rechercher"
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />

          {text.length > 0 ? (
            <CloseButton onClose={() => onChangeText('')} isSmall />
          ) : (
            <Image source={require('@assets/icons/search.svg')} style={globalStyle.iconSmall} />
          )}
        </View>
      </View>
      <View style={styles.informationMessage}>
        <Image source={require('@assets/icons/attention-filled.svg')} style={globalStyle.iconSmall} />
        <ThemedText type="small" themeColor="slateGray">
          La recherche se fait dans la zone en pointillés
        </ThemedText>
      </View>
      <View style={globalStyle.separator} />
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    informationMessage: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.two,
      marginHorizontal: Spacing.two,
      marginVertical: Spacing.two
    },
    input: {
      color: '#2b3a4a',
      flex: 1,
      fontSize: 17,
      paddingVertical: 0
    },
    searchBox: {
      alignItems: 'center',
      borderColor: theme.lightGray,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      height: 48,
      marginRight: Spacing.two,
      paddingHorizontal: Spacing.one
    }
  })
