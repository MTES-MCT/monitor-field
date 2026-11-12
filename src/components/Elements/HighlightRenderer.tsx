import { getHighlightSegments } from '@utils/getHighlightSegments'
import type { ReactNode } from 'react'
import { Text, type TextStyle } from 'react-native'
import { Renderer } from 'react-native-marked'

// Markdown renderer highlighting the parts of the text matching `searchQuery`
export class HighlightRenderer extends Renderer {
  private highlightStyle: TextStyle
  private searchQuery: string

  constructor(searchQuery: string, highlightColor: string) {
    super()
    this.searchQuery = searchQuery
    this.highlightStyle = { backgroundColor: highlightColor }
  }

  override text(text: string | ReactNode[], styles?: TextStyle): ReactNode {
    return super.text(this.highlight(text), styles)
  }

  override escape(text: string, styles?: TextStyle): ReactNode {
    return super.text(this.highlight(text), styles)
  }

  override strong(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return super.strong(this.highlight(children), styles)
  }

  override em(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return super.em(this.highlight(children), styles)
  }

  override del(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return super.del(this.highlight(children), styles)
  }

  override link(children: string | ReactNode[], href: string, styles?: TextStyle, title?: string): ReactNode {
    return super.link(this.highlight(children), href, styles, title)
  }

  private highlight<T extends string | ReactNode[]>(children: T): T | ReactNode[] {
    if (typeof children !== 'string') {
      return children
    }

    return getHighlightSegments(children, this.searchQuery).map((segment, index) =>
      segment.highlighted ? (
        // oxlint-disable-next-line react/no-array-index-key
        <Text key={index} style={this.highlightStyle}>
          {segment.text}
        </Text>
      ) : (
        segment.text
      )
    )
  }
}
