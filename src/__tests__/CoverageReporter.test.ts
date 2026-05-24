import { describe, test, expect, beforeEach } from 'vitest'
import { CoverageReporter } from '../CoverageReporter'
import { CoverageData, ChangedFile, CoverageReport } from '../types'

describe('CoverageReporter', () => {
  let coverageData: CoverageData
  let changedFiles: ChangedFile[]
  let report: CoverageReport

  beforeEach(() => {
    // Sample coverage data
    coverageData = {
      'src/components/Button.tsx': {
        file: 'src/components/Button.tsx',
        lines: { found: 10, hit: 8 },
        functions: { found: 5, hit: 4 },
        branches: { found: 6, hit: 5 }
      },
      'src/components/Modal.tsx': {
        file: 'src/components/Modal.tsx',
        lines: { found: 20, hit: 15 },
        functions: { found: 8, hit: 6 },
        branches: { found: 10, hit: 8 }
      },
      'src/utils/helper.ts': {
        file: 'src/utils/helper.ts',
        lines: { found: 15, hit: 12 },
        functions: { found: 6, hit: 5 },
        branches: { found: 8, hit: 6 }
      }
    }

    // Changed files (only some of the files in coverage data)
    changedFiles = [
      { filename: 'src/components/Button.tsx', status: 'modified' },
      { filename: 'src/components/Modal.tsx', status: 'added' }
    ]
  })

  describe('generateMarkdownReport with allFilesCoverageVisible = false (default)', () => {
    let coverageReporter: CoverageReporter
    let markdown: string

    beforeEach(() => {
      coverageReporter = new CoverageReporter(0, 0, false)
      report = coverageReporter.generateReport(coverageData, changedFiles)
      markdown = coverageReporter.generateMarkdownReport(report)
    })

    test('should not include "All Files" section', () => {
      expect(markdown).not.toContain('### All Files')
    })

    test('should include "Changed Files" section', () => {
      expect(markdown).toContain('### Changed Files')
    })

    test('should include coverage report header', () => {
      expect(markdown).toContain('## Coverage Report')
    })

    test('should include changed files details', () => {
      expect(markdown).toContain('Files changed:')
    })
  })

  describe('generateMarkdownReport with allFilesCoverageVisible = true', () => {
    let coverageReporter: CoverageReporter
    let markdown: string

    beforeEach(() => {
      coverageReporter = new CoverageReporter(0, 0, true)
      report = coverageReporter.generateReport(coverageData, changedFiles)
      markdown = coverageReporter.generateMarkdownReport(report)
    })

    test('should include "All Files" section', () => {
      expect(markdown).toContain('### All Files')
    })

    test('should include "Changed Files" section', () => {
      expect(markdown).toContain('### Changed Files')
    })

    test('should include all files coverage metrics', () => {
      expect(markdown).toMatch(/### All Files\n- Lines: \d+\/\d+ \(\d+\.\d+%\)/)
      expect(markdown).toMatch(/- Functions: \d+\/\d+ \(\d+\.\d+%\)/)
      expect(markdown).toMatch(/- Branches: \d+\/\d+ \(\d+\.\d+%\)/)
    })

    test('should include changed files coverage metrics', () => {
      expect(markdown).toMatch(/### Changed Files\n- Lines: \d+\/\d+ \(\d+\.\d+%\)/)
    })

    test('should display "All Files" before "Changed Files"', () => {
      const allFilesIndex = markdown.indexOf('### All Files')
      const changedFilesIndex = markdown.indexOf('### Changed Files')
      expect(allFilesIndex).toBeGreaterThan(-1)
      expect(changedFilesIndex).toBeGreaterThan(-1)
      expect(allFilesIndex).toBeLessThan(changedFilesIndex)
    })
  })

  describe('generateReport', () => {
    let coverageReporter: CoverageReporter

    beforeEach(() => {
      coverageReporter = new CoverageReporter(0, 0, false)
      report = coverageReporter.generateReport(coverageData, changedFiles)
    })

    test('should calculate all files coverage correctly', () => {
      // Total lines: 10 + 20 + 15 = 45
      // Hit lines: 8 + 15 + 12 = 35
      expect(report.allFiles.linesTotal).toBe(45)
      expect(report.allFiles.linesHit).toBe(35)
      expect(report.allFiles.linesCoverage).toBeCloseTo(77.78, 1)
    })

    test('should calculate changed files coverage correctly', () => {
      // Total lines for changed files: 10 + 20 = 30
      // Hit lines for changed files: 8 + 15 = 23
      expect(report.changedFiles.linesTotal).toBe(30)
      expect(report.changedFiles.linesHit).toBe(23)
      expect(report.changedFiles.linesCoverage).toBeCloseTo(76.67, 1)
    })

    test('should include only changed files in fileDetails', () => {
      expect(report.fileDetails).toHaveLength(2)
      expect(report.fileDetails.map(f => f.file)).toEqual([
        'src/components/Button.tsx',
        'src/components/Modal.tsx'
      ])
    })
  })
})
