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
  border: {
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
    borderTopColor: 'lightgray',
    borderTopWidth: 1,
    marginTop: Spacing.three,
    paddingBottom: Spacing.three
  },
  circle: {
    borderRadius: '50%',
    height: 10,
    width: 10
  },
  content: {
    paddingBottom: 80,
    paddingTop: Spacing.two
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
  horizontalPadding: {
    paddingHorizontal: Spacing.four
  },
  labelStyle: {
    color: 'slategray',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four
  },
  labelWithCircle: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four
  },
  listContent: {
    paddingBottom: Spacing.four
  },
  separator: {
    backgroundColor: 'lightgray',
    height: 1,
    marginVertical: Spacing.four
  },
  square: {
    borderWidth: 1,
    height: 20,
    width: 20
  },
  title: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two
  },
  titleText: {
    flex: 1,
    flexWrap: 'wrap'
  },
  titleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four
  }
})
