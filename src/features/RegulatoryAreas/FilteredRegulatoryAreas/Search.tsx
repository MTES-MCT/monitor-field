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
      <Pressable accessibilityRole="button" onPress={onCloseSearchInput}>
        <Image source={require('../../../../assets/icons/chevron.svg')} style={styles.icon} />
      </Pressable>
      <TextInput
        ref={inputRef}
        autoFocus={isSearchByQueryActive}
        style={[styles.input, { borderColor: theme.lightGray }]}
        onChangeText={onChangeText}
        value={text}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  input: {
    borderWidth: 1,
    flex: 1,
    fontFamily: Fonts.sansMedium,
    height: 48,
    margin: Spacing.four
  },
  wrapper: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row'
  }
})
