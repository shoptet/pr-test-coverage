import { describe, test, expect, beforeEach } from 'vitest'
import { DirectoryStructure, DirectoryNode, FileDetail } from '../DirectoryStructure'

describe('DirectoryStructure', () => {
  let directoryStructure: DirectoryStructure

  beforeEach(() => {
    directoryStructure = new DirectoryStructure()
  })

  describe('Given a list of file details with coverage data', () => {
    let fileDetails: FileDetail[]

    beforeEach(() => {
      fileDetails = [
        {
          file: 'src/components/Modal/Modal.tsx',
          lines: { hit: 12, total: 24, percentage: 50.0 },
          functions: { hit: 7, total: 10, percentage: 70.0 },
          branches: { hit: 12, total: 15, percentage: 80.0 },
        },
        {
          file: 'src/components/Button/Button.tsx',
          lines: { hit: 6, total: 10, percentage: 60.0 },
          functions: { hit: 4, total: 5, percentage: 80.0 },
          branches: { hit: 8, total: 10, percentage: 80.0 },
        },
        {
          file: 'src/components/Modal/Modal.types.ts',
          lines: { hit: 1, total: 2, percentage: 50.0 },
          functions: { hit: 1, total: 1, percentage: 100.0 },
          branches: { hit: 2, total: 2, percentage: 100.0 },
        },
        {
          file: 'src/useValidation.ts',
          lines: { hit: 3, total: 4, percentage: 75.0 },
          functions: { hit: 3, total: 3, percentage: 100.0 },
          branches: { hit: 2, total: 4, percentage: 50.0 },
        },
      ]
    })

    describe('When building directory tree', () => {
      let directoryTree: DirectoryNode | null

      beforeEach(() => {
        directoryTree = directoryStructure.buildDirectoryTree(fileDetails)
      })

      test('Then it should create a proper nested structure', () => {
        expect(directoryTree?.name).toBe('src')
        expect(directoryTree?.children).toHaveLength(2) // components folder and useValidation.ts file

        const componentsDir = directoryTree?.children.find((child) => child.name === 'components')
        expect(componentsDir).toBeDefined()
        expect(componentsDir!.isDirectory).toBe(true)
        expect(componentsDir!.children).toHaveLength(2) // Button and Modal folders

        const buttonDir = componentsDir!.children.find((child) => child.name === 'Button')
        expect(buttonDir).toBeDefined()
        expect(buttonDir!.isDirectory).toBe(true)
        expect(buttonDir!.children).toHaveLength(1) // Button.tsx file

        const modalDir = componentsDir!.children.find((child) => child.name === 'Modal')
        expect(modalDir).toBeDefined()
        expect(modalDir!.isDirectory).toBe(true)
        expect(modalDir!.children).toHaveLength(2) // Modal.tsx and Modal.types.ts files
      })

      test('Then it should calculate aggregated statistics for directories', () => {
        // Root src directory should have aggregated stats
        expect(directoryTree?.coverage.lines.hit).toBe(22) // 6+12+1+3
        expect(directoryTree?.coverage.lines.total).toBe(40) // 10+24+2+4
        expect(directoryTree?.coverage.lines.percentage).toBe(55.0)

        expect(directoryTree?.coverage.functions.hit).toBe(15) // 4+7+1+3
        expect(directoryTree?.coverage.functions.total).toBe(19) // 5+10+1+3
        expect(directoryTree?.coverage.functions.percentage).toBe(78.9)

        expect(directoryTree?.coverage.branches.hit).toBe(24) // 8+12+2+2
        expect(directoryTree?.coverage.branches.total).toBe(31) // 10+15+2+4
        expect(directoryTree?.coverage.branches.percentage).toBe(77.4)

        // Components directory should have aggregated stats for its children
        const componentsDir = directoryTree?.children.find((child) => child.name === 'components')
        expect(componentsDir?.coverage.lines.hit).toBe(19) // 6+12+1
        expect(componentsDir?.coverage.lines.total).toBe(36) // 10+24+2
        expect(componentsDir?.coverage.lines.percentage).toBe(52.8)

        // Button directory should match its single file
        const buttonDir = componentsDir?.children.find((child) => child.name === 'Button')
        expect(buttonDir?.coverage.lines.hit).toBe(6)
        expect(buttonDir?.coverage.lines.total).toBe(10)
        expect(buttonDir?.coverage.lines.percentage).toBe(60.0)
      })

      test('Then it should sort directories and files alphabetically', () => {
        const componentsDir = directoryTree?.children.find((child) => child.name === 'components')
        const childNames = componentsDir?.children.map((child) => child.name)
        expect(childNames).toEqual(['Button', 'Modal']) // Alphabetical order

        const modalDir = componentsDir?.children.find((child) => child.name === 'Modal')
        const modalFiles = modalDir?.children.map((child) => child.name)
        expect(modalFiles).toEqual(['Modal.tsx', 'Modal.types.ts']) // Alphabetical order
      })

      test('Then it should preserve file details for leaf nodes', () => {
        const componentsDir = directoryTree?.children.find((child) => child.name === 'components')
        const buttonDir = componentsDir?.children.find((child) => child.name === 'Button')
        const buttonFile = buttonDir?.children[0]

        expect(buttonFile?.isDirectory).toBe(false)
        expect(buttonFile?.fileDetail).toBeDefined()
        expect(buttonFile?.fileDetail?.file).toBe('src/components/Button/Button.tsx')
        expect(buttonFile?.coverage.lines.hit).toBe(6)
        expect(buttonFile?.coverage.lines.total).toBe(10)
      })
    })
  })

  describe('Given an empty file list', () => {
    let result: DirectoryNode | null

    beforeEach(() => {
      result = directoryStructure.buildDirectoryTree([])
    })

    test('Then it should return null', () => {
      expect(result).toBeNull()
    })
  })

  describe('Given a single root directory', () => {
    let result: DirectoryNode | null

    beforeEach(() => {
      const fileDetails: FileDetail[] = [
        {
          file: 'utils/helper.ts',
          lines: { hit: 5, total: 10, percentage: 50.0 },
          functions: { hit: 2, total: 4, percentage: 50.0 },
          branches: { hit: 3, total: 6, percentage: 50.0 },
        },
      ]
      result = directoryStructure.buildDirectoryTree(fileDetails)
    })

    test('Then it should return the single root directory', () => {
      expect(result).not.toBeNull()
      expect(result!.name).toBe('utils')
      expect(result!.isDirectory).toBe(true)
      expect(result!.children).toHaveLength(1)
      expect(result!.children[0].name).toBe('helper.ts')
    })

    test('Then it should have correct aggregated coverage', () => {
      expect(result?.coverage.lines.hit).toBe(5)
      expect(result?.coverage.lines.total).toBe(10)
      expect(result?.coverage.lines.percentage).toBe(50.0)
    })
  })

  describe('Given files with zero totals', () => {
    let result: DirectoryNode | null

    beforeEach(() => {
      const fileDetails: FileDetail[] = [
        {
          file: 'empty/file1.ts',
          lines: { hit: 0, total: 0, percentage: 0 },
          functions: { hit: 0, total: 0, percentage: 0 },
          branches: { hit: 0, total: 0, percentage: 0 },
        },
        {
          file: 'empty/file2.ts',
          lines: { hit: 0, total: 0, percentage: 0 },
          functions: { hit: 0, total: 0, percentage: 0 },
          branches: { hit: 0, total: 0, percentage: 0 },
        },
      ]
      result = directoryStructure.buildDirectoryTree(fileDetails)
    })

    test('Then it should handle zero division gracefully', () => {
      expect(result).not.toBeNull()
      expect(result!.name).toBe('empty')
      expect(result!.coverage.lines.percentage).toBe(0)
      expect(result!.coverage.functions.percentage).toBe(0)
      expect(result!.coverage.branches.percentage).toBe(0)
    })

    test('Then it should have zero totals', () => {
      expect(result?.coverage.lines.total).toBe(0)
      expect(result?.coverage.functions.total).toBe(0)
      expect(result?.coverage.branches.total).toBe(0)
    })
  })

  describe('Given files from different root directories', () => {
    let fileDetails: FileDetail[]

    beforeEach(() => {
      fileDetails = [
        {
          file: 'src/utils.ts',
          lines: { hit: 5, total: 10, percentage: 50.0 },
          functions: { hit: 2, total: 4, percentage: 50.0 },
          branches: { hit: 3, total: 6, percentage: 50.0 },
        },
        {
          file: 'tests/utils.test.ts',
          lines: { hit: 8, total: 10, percentage: 80.0 },
          functions: { hit: 4, total: 5, percentage: 80.0 },
          branches: { hit: 6, total: 8, percentage: 75.0 },
        },
      ]
    })

    describe('When building directory tree', () => {
      let directoryTree: DirectoryNode | null

      beforeEach(() => {
        directoryTree = directoryStructure.buildDirectoryTree(fileDetails)
      })

      test('Then it should create a virtual root with multiple top-level directories', () => {
        expect(directoryTree?.name).toBe('') // Virtual root
        expect(directoryTree?.children).toHaveLength(2) // src and tests directories

        const srcDir = directoryTree?.children.find((child) => child.name === 'src')
        const testsDir = directoryTree?.children.find((child) => child.name === 'tests')

        expect(srcDir).toBeDefined()
        expect(testsDir).toBeDefined()
        expect(srcDir?.isDirectory).toBe(true)
        expect(testsDir?.isDirectory).toBe(true)
      })
    })
  })
})
