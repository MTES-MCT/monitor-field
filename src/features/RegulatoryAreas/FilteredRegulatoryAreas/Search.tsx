import { ThemedText } from '@components/Text'
import { Fonts, Spacing } from '@constants/theme'
import { useRegulatoryAreasContext } from '@contexts/RegulatoryAreasContext'
import { useTheme } from '@hooks/use-theme'
import { Image } from 'expo-image'
import { useRef, useState } from 'react'
import { StyleSheet, TextInput, Pressable, View } from 'react-native'

export function Search({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<TextInput>(null)
  const theme = useTheme()
  const { filters, setFilters, isSearchByQueryActive } = useRegulatoryAreasContext()

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

  return (
    <View style={[styles.wrapper, { borderBottomColor: theme.lightGray }]}>
      <Pressable accessibilityRole="button" onPress={onCloseSearchInput} style={{}}>
        <Image source={require('../../../../assets/icons/chevron.svg')} style={[styles.icon, styles.chevronIcon]} />
      </Pressable>
      <View>
        <TextInput
          ref={inputRef}
          autoFocus={isSearchByQueryActive}
          style={[styles.input, { borderColor: theme.lightGray }]}
          onChangeText={onChangeText}
          value={text}
        />
        <View style={styles.informationMessage}>
          <Image source={require('../../../../assets/icons/attention-filled.svg')} style={styles.icon} />
          <ThemedText type="small" themeColor="slateGray">
            La recherche se fait dans la zone en pointillés
          </ThemedText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chevronIcon: {
    marginLeft: Spacing.two,
    marginTop: Spacing.two
  },
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  informationMessage: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.two
  },
  input: {
    borderWidth: 1,
    fontFamily: Fonts.sansMedium,
    height: 48
  },
  wrapper: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two
  }
})
