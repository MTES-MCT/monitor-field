import { Fonts, Spacing } from "@constants/theme";
import { useRegulatoryAreasContext } from "@contexts/RegulatoryAreasContext";
import { useTheme } from "@hooks/use-theme";
import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export function Search() {
  const theme = useTheme();
  const { filters, setFilters } = useRegulatoryAreasContext();
  const [text, setText] = useState(filters.searchQuery ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const onChangeText = (newText: string) => {
    setText(newText);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        searchQuery: newText.trim() ? newText.trim() : undefined,
      }));
    }, 300);
  };

  return (
    <View style={[styles.wrapper, { borderBottomColor: theme.lightGray }]}>
      <TextInput
        autoFocus
        style={[styles.input, { borderColor: theme.lightGray }]}
        onChangeText={onChangeText}
        value={text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    margin: Spacing.four,
    borderWidth: 1,
    fontFamily: Fonts.sansMedium,
  },
  wrapper: {
    borderBottomWidth: 1,
  },
});
