import { createHash } from 'crypto'
import { DirectoryNode } from './DirectoryStructure'

export class MarkdownTableGenerator {
  public generateTable(directoryTree: DirectoryNode | null, prFilesUrl?: string): string {
    if (!directoryTree) {
      return ''
    }

    const rows: string[] = []

    rows.push('| **File** | **Coverage % (lines)** |')
    rows.push('|------|-------|')

    this.generateTableRows(directoryTree, rows, prFilesUrl)

    return rows.join('\n')
  }

  private generateTableRows(node: DirectoryNode, rows: string[], prFilesUrl?: string): void {
    if (node.isDirectory) {
      for (const child of node.children) {
        this.generateTableRows(child, rows, prFilesUrl)
      }
      return
    }

    const filePath = node.fileDetail?.file ?? node.name
    const displayName = prFilesUrl ? `[${filePath}](${this.buildFileLink(prFilesUrl, filePath)})` : filePath
    const coverage = `${node.coverage.lines.percentage.toFixed(1)}% (${node.coverage.lines.hit}/${node.coverage.lines.total})`

    rows.push(`| ${displayName} | ${coverage} |`)
  }

  private buildFileLink(prFilesUrl: string, filePath: string): string {
    const anchor = createHash('sha256').update(filePath).digest('hex')
    return `${prFilesUrl}#diff-${anchor}`
  }
}
