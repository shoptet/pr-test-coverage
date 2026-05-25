import { DirectoryNode } from './DirectoryStructure'

export class MarkdownTableGenerator {
  generateTable(directoryTree: DirectoryNode | null): string {
    if (!directoryTree) {
      return ''
    }

    const rows: string[] = []
    
    // Add table headers
    rows.push('| **File** | **Lines** | **Line %** | **Functions** | **Function %** | **Branches** | **Branch %** |')
    rows.push('|------|-------|--------|-----------|------------|----------|----------|')
    
    // Generate table rows recursively
    this.generateTableRows(directoryTree, 0, rows)
    
    return rows.join('\n')
  }

  private generateTableRows(node: DirectoryNode, depth: number, rows: string[]): void {
    const indentation = this.getIndentation(depth)
    // const icon = node.isDirectory ? '📁' : '📄'
    const name = `${indentation} ${node.name}`
    
    if (node.isDirectory) {
      // Format directory row with bold formatting
      const paddedName = this.padName(name, true)
      const linesData = `**${node.coverage.lines.hit}/${node.coverage.lines.total}**`
      const linesPercent = `**${node.coverage.lines.percentage.toFixed(1)}%**`
      const functionsData = `**${node.coverage.functions.hit}/${node.coverage.functions.total}**`
      const functionsPercent = `**${node.coverage.functions.percentage.toFixed(1)}%**`
      const branchesData = `**${node.coverage.branches.hit}/${node.coverage.branches.total}**`
      const branchesPercent = `**${node.coverage.branches.percentage.toFixed(1)}%**`
      
      rows.push(`| ${paddedName} | ${linesData} | ${linesPercent} | ${functionsData} | ${functionsPercent} | ${branchesData} | ${branchesPercent} |`)
      
      // Recursively add children
      for (const child of node.children) {
        this.generateTableRows(child, depth + 1, rows)
      }
    } else {
      // Format file row without bold formatting
      const paddedName = this.padName(name, false)
      const linesData = `${node.coverage.lines.hit}/${node.coverage.lines.total}`
      const linesPercent = `${node.coverage.lines.percentage.toFixed(1)}%`
      const functionsData = `${node.coverage.functions.hit}/${node.coverage.functions.total}`
      const functionsPercent = `${node.coverage.functions.percentage.toFixed(1)}%`
      const branchesData = `${node.coverage.branches.hit}/${node.coverage.branches.total}`
      const branchesPercent = `${node.coverage.branches.percentage.toFixed(1)}%`
      
      rows.push(`| ${paddedName} | ${linesData} | ${linesPercent} | ${functionsData} | ${functionsPercent} | ${branchesData} | ${branchesPercent} |`)
    }
  }

  private getIndentation(depth: number): string {
    if (depth === 0) {
      return ''
    }
    
    // Build indentation using &emsp; and &nbsp; for proper alignment
    let indentation = ''
    
    // Add &emsp; for each level
    for (let i = 0; i < depth; i++) {
      indentation += '&emsp;'
    }
    
    // Add final spacing before the icon based on depth
    if (depth === 1) {
      indentation += ' '
    } else if (depth === 2) {
      indentation += '&nbsp; '
    } else if (depth >= 3) {
      indentation += '&nbsp;&nbsp; '
    }
    
    return indentation
  }

  private padName(name: string, isBold: boolean): string {
    // No padding needed since markdown table renderers ignore extra spaces
    return isBold ? `**${name}**` : name
  }
}
