import { Spacing } from '@constants/theme'
import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  areaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two
  },
  emptyState: {
    paddingHorizontal: Spacing.four
  },
  groupButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two
  },
  icon: {
    height: Spacing.five,
    width: Spacing.five
  },
  listContent: {
    paddingBottom: Spacing.four
  },
  square: {
    borderWidth: 1,
    height: 20,
    width: 20
  },
  title: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two
  },
  titleText: {
    flexShrink: 1
  },
  titleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four
  }
})
