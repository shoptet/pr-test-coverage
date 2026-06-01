import { DirectoryNode } from './DirectoryStructure'

export class MarkdownTableGenerator {
  public generateTable(directoryTree: DirectoryNode | null): string {
    if (!directoryTree) {
      return ''
    }

    const rows: string[] = []

    rows.push('| **File** | **Lines** | **Line %** |')
    rows.push('|------|-------|--------|')

    this.generateTableRows(directoryTree, rows)

    return rows.join('\n')
  }

  private generateTableRows(node: DirectoryNode, rows: string[]): void {
    const name = `${node.name}`

    if (node.isDirectory) {
      for (const child of node.children) {
        this.generateTableRows(child, rows)
      }
    } else {
      const displayName = node.fileDetail?.file ?? name
      const linesData = `${node.coverage.lines.hit}/${node.coverage.lines.total}`
      const linesPercent = `${node.coverage.lines.percentage.toFixed(1)}%`

      rows.push(`| ${displayName} | ${linesData} | ${linesPercent} |`)
    }
  }
}
