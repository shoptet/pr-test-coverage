import { CoverageData, FileCoverage } from './types'
import * as fs from 'fs'
import * as xml2js from 'xml2js'
import * as path from 'path'

export class PhpUnitXmlParser {
  async parse(coverageXmlDir: string): Promise<CoverageData> {
    try {
      const indexPath = path.join(coverageXmlDir, 'index.xml')

      if (!fs.existsSync(indexPath)) {
        throw new Error(`Coverage XML directory must contain index.xml at: ${indexPath}`)
      }

      const xmlContent = fs.readFileSync(indexPath, 'utf-8')
      const parser = new xml2js.Parser()
      const result = await parser.parseStringPromise(xmlContent)

      const coverageData: CoverageData = {}

      // Navigate the PHPUnit XML structure
      // Structure: phpunit > project > directory > file
      const phpunit = result.phpunit
      if (!phpunit) {
        throw new Error('Invalid PHPUnit XML: missing phpunit element')
      }

      const project = phpunit.project?.[0]
      if (!project) {
        return coverageData // Empty coverage
      }

      // Helper function to process file elements recursively
      const processDirectory = (dir: any) => {
        // Process files in this directory
        const files = dir.file || []
        for (const file of files) {
          processFile(file)
        }

        // Process subdirectories recursively
        const subdirs = dir.directory || []
        for (const subdir of subdirs) {
          processDirectory(subdir)
        }
      }

      // Helper function to process file elements
      const processFile = (file: any) => {
        const href = file.$.href
        const fileName = file.$.name
        if (!href || !fileName) {
          return
        }

        // Extract metrics from file/totals element
        const totals = file.totals?.[0]
        if (!totals) {
          return
        }

        const lines = totals.lines?.[0]?.$
        const methods = totals.methods?.[0]?.$
        const functions = totals.functions?.[0]?.$

        if (!lines) {
          return
        }

        // Parse PHPUnit XML metrics
        // PHPUnit XML uses: executable (total lines), executed (lines hit)
        const linesTotal = parseInt(lines.executable || '0', 10)
        const linesHit = parseInt(lines.executed || '0', 10)

        // Methods and functions are combined in PHPUnit
        const methodsTotal = parseInt(methods?.count || '0', 10)
        const methodsHit = parseInt(methods?.tested || '0', 10)
        const functionsTotal = parseInt(functions?.count || '0', 10)
        const functionsHit = parseInt(functions?.tested || '0', 10)

        // Combine methods and functions
        const combinedFunctionsTotal = methodsTotal + functionsTotal
        const combinedFunctionsHit = methodsHit + functionsHit

        // PHPUnit XML doesn't track branches separately in the totals
        // We'll set branches to 0 for now
        const branchesTotal = 0
        const branchesHit = 0

        // Build the full file path by parsing the href
        // The href is relative to the coverage-xml directory (e.g., "Covered/Calculator.php.xml")
        // We need to extract the actual source file path
        const fileXmlPath = path.join(coverageXmlDir, href)
        const filePath = this.extractSourcePath(fileXmlPath, fileName)

        const fileCoverage: FileCoverage = {
          file: filePath,
          lines: {
            found: linesTotal,
            hit: linesHit
          },
          functions: {
            found: combinedFunctionsTotal,
            hit: combinedFunctionsHit
          },
          branches: {
            found: branchesTotal,
            hit: branchesHit
          }
        }

        coverageData[filePath] = fileCoverage
      }

      // Start processing from the root directory
      const rootDirectory = project.directory?.[0]
      if (rootDirectory) {
        processDirectory(rootDirectory)
      }

      return coverageData
    } catch (error) {
      throw new Error(`Failed to parse PHPUnit XML: ${error}`)
    }
  }

  /**
   * Extracts the source file path from a PHPUnit XML file
   * This reads the individual file XML to get the path attribute
   */
  private extractSourcePath(fileXmlPath: string, fileName: string): string {
    try {
      if (!fs.existsSync(fileXmlPath)) {
        // Fallback to just the filename if XML doesn't exist
        return fileName
      }

      const xmlContent = fs.readFileSync(fileXmlPath, 'utf-8')
      const match = xmlContent.match(/path="([^"]*)"/)

      if (match && match[1]) {
        const dirPath = match[1]
        // Remove leading slash and combine with filename
        const cleanPath = dirPath.replace(/^\//, '')
        return cleanPath ? `${cleanPath}/${fileName}` : fileName
      }

      return fileName
    } catch (error) {
      // On error, return just the filename
      return fileName
    }
  }
}
