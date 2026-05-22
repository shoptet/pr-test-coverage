import { CoverageData, FileCoverage } from './types'
import * as fs from 'fs'
import * as xml2js from 'xml2js'

export class CloverParser {
  async parse(cloverFilePath: string): Promise<CoverageData> {
    try {
      const xmlContent = fs.readFileSync(cloverFilePath, 'utf-8')
      const parser = new xml2js.Parser()
      const result = await parser.parseStringPromise(xmlContent)

      const coverageData: CoverageData = {}

      // Navigate the Clover XML structure
      // Structure: coverage > project > package > file
      const coverage = result.coverage
      if (!coverage) {
        throw new Error('Invalid Clover XML: missing coverage element')
      }

      const project = coverage.project?.[0]
      if (!project) {
        return coverageData // Empty coverage
      }

      // Helper function to process file elements
      const processFile = (file: any) => {
        const fileName = file.$.path || file.$.name
        if (!fileName) {
          return
        }

        // Extract metrics from file element
        const metrics = file.metrics?.[0]?.$
        if (!metrics) {
          return
        }

        // Parse Clover metrics
        // Clover uses: elements, coveredelements, statements, coveredstatements,
        // conditionals, coveredconditionals, methods, coveredmethods
        const linesTotal = parseInt(metrics.statements || '0', 10)
        const linesHit = parseInt(metrics.coveredstatements || '0', 10)
        const branchesTotal = parseInt(metrics.conditionals || '0', 10)
        const branchesHit = parseInt(metrics.coveredconditionals || '0', 10)
        const functionsTotal = parseInt(metrics.methods || '0', 10)
        const functionsHit = parseInt(metrics.coveredmethods || '0', 10)

        const fileCoverage: FileCoverage = {
          file: fileName,
          lines: {
            found: linesTotal,
            hit: linesHit
          },
          functions: {
            found: functionsTotal,
            hit: functionsHit
          },
          branches: {
            found: branchesTotal,
            hit: branchesHit
          }
        }

        coverageData[fileName] = fileCoverage
      }

      // Process files directly under project (some Clover formats)
      const directFiles = project.file || []
      for (const file of directFiles) {
        processFile(file)
      }

      // Process packages (standard Clover format)
      const packages = project.package || []
      for (const pkg of packages) {
        const files = pkg.file || []
        for (const file of files) {
          processFile(file)
        }
      }

      return coverageData
    } catch (error) {
      throw new Error(`Failed to parse Clover file: ${error}`)
    }
  }
}
