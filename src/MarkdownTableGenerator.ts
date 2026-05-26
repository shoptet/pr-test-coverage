import { DirectoryNode } from './DirectoryStructure'

export class MarkdownTableGenerator {
  public generateTable(directoryTree: DirectoryNode | null): string {
    if (!directoryTree) {
      return ''
    }

    const rows: string[] = []
    
    // Add table headers
    rows.push('| **File** | **Lines** | **Line %** | **Functions** | **Function %** |')
    rows.push('|------|-------|--------|-----------|------------|')
    
    // Generate table rows recursively
    this.generateTableRows(directoryTree, rows)
    
    return rows.join('\n')
  }

  private generateTableRows(node: DirectoryNode, rows: string[]): void {
    const name = `${node.name}`
    
    if (node.isDirectory) {
      // Recursively add children
      for (const child of node.children) {
        this.generateTableRows(child, rows)
      }
    } else {
      const linesData = `${node.coverage.lines.hit}/${node.coverage.lines.total}`
      const linesPercent = `${node.coverage.lines.percentage.toFixed(1)}%`
      const functionsData = `${node.coverage.functions.hit}/${node.coverage.functions.total}`
      const functionsPercent = `${node.coverage.functions.percentage.toFixed(1)}%`

      rows.push(`| ${name} | ${linesData} | ${linesPercent} | ${functionsData} | ${functionsPercent} |`)
    }
  }
}
