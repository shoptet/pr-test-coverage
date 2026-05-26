import { CoverageData, CoverageReport, CoverageSummary, ChangedFile } from './types'
import { DirectoryStructure, FileDetail } from './DirectoryStructure'
import { MarkdownTableGenerator } from './MarkdownTableGenerator'
import * as core from '@actions/core'
import * as path from 'path'

export class CoverageReporter {
  private readonly allFilesMinimumCoverage: number
  private readonly changedFilesMinimumCoverage: number

  constructor(allFilesMinimumCoverage: number = 0, changedFilesMinimumCoverage: number = 0) {
    this.allFilesMinimumCoverage = allFilesMinimumCoverage
    this.changedFilesMinimumCoverage = changedFilesMinimumCoverage
  }

  generateReport(coverageData: CoverageData, changedFiles: ChangedFile[]): CoverageReport {
    const allFiles = this.calculateSummary(Object.values(coverageData))
    
    // Path matching logic - optimized to avoid O(n²) complexity
    const pathMatches = new Map<string, string>()
    const lcovFiles = Object.keys(coverageData)
    
    // Create normalized lookup maps for better performance
    const normalizedLcovMap = new Map<string, string>()
    lcovFiles.forEach(lcovFile => {
      const normalized = path.normalize(lcovFile.replace(/^\.\//, ''))
      normalizedLcovMap.set(normalized, lcovFile)
    })
    
    changedFiles.forEach(changedFile => {
      const changedPath = changedFile.filename
      
      // Try exact match first
      if (coverageData[changedPath]) {
        pathMatches.set(changedPath, changedPath)
        return
      }
      
      // Normalize the changed file path
      const normalizedChanged = path.normalize(changedPath.replace(/^\.\//, ''))
      
      // Check normalized exact match
      if (normalizedLcovMap.has(normalizedChanged)) {
        pathMatches.set(changedPath, normalizedLcovMap.get(normalizedChanged)!)
        return
      }
      
      // Check for suffix/prefix matches (less common, so check last)
      for (const [normalizedLcov, originalLcov] of normalizedLcovMap.entries()) {
        if (normalizedChanged.endsWith(normalizedLcov) || normalizedLcov.endsWith(normalizedChanged)) {
          pathMatches.set(changedPath, originalLcov)
          break
        }
      }
    })
    
    // Filter coverage data for changed files using the path matches
    const changedFileCoverage = changedFiles
      .map(file => {
        const matchedLcovPath = pathMatches.get(file.filename)
        if (matchedLcovPath) {
          return coverageData[matchedLcovPath]
        }
        
        return undefined
      })
      .filter(coverage => coverage !== undefined)
    
    const changedFilesSummary = this.calculateSummary(changedFileCoverage)
    
    // Generate file details for changed files, ordered by directory
    const fileDetails = changedFiles
      .filter(file => pathMatches.has(file.filename))
      .map(file => {
        const matchedLcovPath = pathMatches.get(file.filename)!
        const coverage = coverageData[matchedLcovPath]
        return {
          file: file.filename,
          lines: {
            hit: coverage.lines.hit,
            total: coverage.lines.found,
            percentage: coverage.lines.found > 0 ? (coverage.lines.hit / coverage.lines.found) * 100 : 0
          },
          functions: {
            hit: coverage.functions.hit,
            total: coverage.functions.found,
            percentage: coverage.functions.found > 0 ? (coverage.functions.hit / coverage.functions.found) * 100 : 0
          },
          branches: {
            hit: coverage.branches.hit,
            total: coverage.branches.found,
            percentage: coverage.branches.found > 0 ? (coverage.branches.hit / coverage.branches.found) * 100 : 0
          }
        }
      })
      .sort((a, b) => {
        const dirA = path.dirname(a.file)
        const dirB = path.dirname(b.file)
        if (dirA !== dirB) {
          return dirA.localeCompare(dirB)
        }
        return a.file.localeCompare(b.file)
      })

    return {
      allFiles,
      changedFiles: changedFilesSummary,
      fileDetails
    }
  }

  generateMarkdownReport(report: CoverageReport, title: string): string {
    let markdown = `### ${title}\n\n`
    
    // Changed Files Summary
    markdown += `### Changed Files\n`
    markdown += `- Lines: ${report.changedFiles.linesHit}/${report.changedFiles.linesTotal} (${report.changedFiles.linesCoverage.toFixed(1)}%)\n`
    markdown += `- Methods and Functions: ${report.changedFiles.functionsHit}/${report.changedFiles.functionsTotal} (${report.changedFiles.functionsCoverage.toFixed(1)}%)\n`
    //markdown += `- Branches: ${report.changedFiles.branchesHit}/${report.changedFiles.branchesTotal} (${report.changedFiles.branchesCoverage.toFixed(1)}%)\n\n`

    // File Details Table with nested directory structure
    if (report.fileDetails.length > 0) {
      markdown += `Files changed:\n\n`
      
      // Convert fileDetails to FileDetail format for DirectoryStructure
      const fileDetails: FileDetail[] = report.fileDetails.map(file => ({
        file: file.file,
        lines: {
          hit: file.lines.hit,
          total: file.lines.total,
          percentage: file.lines.percentage
        },
        functions: {
          hit: file.functions.hit,
          total: file.functions.total,
          percentage: file.functions.percentage
        },
        branches: {
          hit: file.branches.hit,
          total: file.branches.total,
          percentage: file.branches.percentage
        }
      }))
      
      // Build directory tree and generate nested table
      const directoryStructure = new DirectoryStructure()
      const directoryTree = directoryStructure.buildDirectoryTree(fileDetails)
      
      const markdownGenerator = new MarkdownTableGenerator()
      const table = markdownGenerator.generateTable(directoryTree)
      
      markdown +=
        '\n<details><summary>Show a code coverage summary of affected files.</summary>\n' +
        '<p>\n\n' +
        table + '\n\n' +
        '</p>\n' +
        '</details> ';
    }

    return markdown
  }

  private calculateSummary(coverageArray: any[]): CoverageSummary {
    const totals = coverageArray.reduce(
      (acc, coverage) => ({
        linesTotal: acc.linesTotal + coverage.lines.found,
        linesHit: acc.linesHit + coverage.lines.hit,
        functionsTotal: acc.functionsTotal + coverage.functions.found,
        functionsHit: acc.functionsHit + coverage.functions.hit,
        branchesTotal: acc.branchesTotal + coverage.branches.found,
        branchesHit: acc.branchesHit + coverage.branches.hit
      }),
      {
        linesTotal: 0,
        linesHit: 0,
        functionsTotal: 0,
        functionsHit: 0,
        branchesTotal: 0,
        branchesHit: 0
      }
    )

    return {
      ...totals,
      linesCoverage: totals.linesTotal > 0 ? (totals.linesHit / totals.linesTotal) * 100 : 0,
      functionsCoverage: totals.functionsTotal > 0 ? (totals.functionsHit / totals.functionsTotal) * 100 : 0,
      branchesCoverage: totals.branchesTotal > 0 ? (totals.branchesHit / totals.branchesTotal) * 100 : 0
    }
  }

}
