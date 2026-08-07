import { ThemedText } from '@components/Text'
import { Spacing } from '@constants/theme'
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
    <>
      <View style={[styles.searchBox, { borderColor: theme.lightGray }]}>
        <Pressable onPress={onCloseSearchInput} hitSlop={8}>
          <Image source={require('@assets/icons/chevron.svg')} style={styles.icon} />
        </Pressable>

        <TextInput
          ref={inputRef}
          autoFocus={isSearchByQueryActive}
          style={styles.input}
          value={text}
          onChangeText={onChangeText}
        />

        {text.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Image source={require('@assets/icons/close.svg')} style={styles.icon} />
          </Pressable>
        )}
      </View>
      <View style={styles.informationMessage}>
        <Image source={require('@assets/icons/attention-filled.svg')} style={styles.icon} />
        <ThemedText type="small" themeColor="slateGray">
          La recherche se fait dans la zone en pointillés
        </ThemedText>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  icon: {
    height: 20,
    width: 20
  },
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
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    marginHorizontal: Spacing.two,
    paddingHorizontal: Spacing.one
  }
})
