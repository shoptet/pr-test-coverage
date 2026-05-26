import { describe, test, expect, beforeEach } from 'vitest'
import { MarkdownTableGenerator } from '../MarkdownTableGenerator'
import { DirectoryNode } from '../DirectoryStructure'

describe('MarkdownTableGenerator', () => {
  let markdownGenerator: MarkdownTableGenerator

  beforeEach(() => {
    markdownGenerator = new MarkdownTableGenerator()
  })

  describe('Given a directory tree with nested structure', () => {
    let directoryTree: DirectoryNode

    beforeEach(() => {
      directoryTree = {
        name: 'src',
        isDirectory: true,
        coverage: {
          lines: { hit: 22, total: 40, percentage: 55.0 },
          functions: { hit: 15, total: 19, percentage: 78.9 },
          branches: { hit: 24, total: 31, percentage: 77.4 }
        },
        children: [
          {
            name: 'components',
            isDirectory: true,
            coverage: {
              lines: { hit: 19, total: 36, percentage: 52.8 },
              functions: { hit: 12, total: 16, percentage: 75.0 },
              branches: { hit: 22, total: 27, percentage: 81.5 }
            },
            children: [
              {
                name: 'Button',
                isDirectory: true,
                coverage: {
                  lines: { hit: 6, total: 10, percentage: 60.0 },
                  functions: { hit: 4, total: 5, percentage: 80.0 },
                  branches: { hit: 8, total: 10, percentage: 80.0 }
                },
                children: [
                  {
                    name: 'Button.tsx',
                    isDirectory: false,
                    coverage: {
                      lines: { hit: 6, total: 10, percentage: 60.0 },
                      functions: { hit: 4, total: 5, percentage: 80.0 },
                      branches: { hit: 8, total: 10, percentage: 80.0 }
                    },
                    children: [],
                    fileDetail: {
                      file: 'src/components/Button/Button.tsx',
                      lines: { hit: 6, total: 10, percentage: 60.0 },
                      functions: { hit: 4, total: 5, percentage: 80.0 },
                      branches: { hit: 8, total: 10, percentage: 80.0 }
                    }
                  }
                ]
              },
              {
                name: 'Modal',
                isDirectory: true,
                coverage: {
                  lines: { hit: 13, total: 26, percentage: 50.0 },
                  functions: { hit: 8, total: 11, percentage: 72.7 },
                  branches: { hit: 14, total: 17, percentage: 82.4 }
                },
                children: [
                  {
                    name: 'Modal.tsx',
                    isDirectory: false,
                    coverage: {
                      lines: { hit: 12, total: 24, percentage: 50.0 },
                      functions: { hit: 7, total: 10, percentage: 70.0 },
                      branches: { hit: 12, total: 15, percentage: 80.0 }
                    },
                    children: [],
                    fileDetail: {
                      file: 'src/components/Modal/Modal.tsx',
                      lines: { hit: 12, total: 24, percentage: 50.0 },
                      functions: { hit: 7, total: 10, percentage: 70.0 },
                      branches: { hit: 12, total: 15, percentage: 80.0 }
                    }
                  },
                  {
                    name: 'Modal.types.ts',
                    isDirectory: false,
                    coverage: {
                      lines: { hit: 1, total: 2, percentage: 50.0 },
                      functions: { hit: 1, total: 1, percentage: 100.0 },
                      branches: { hit: 2, total: 2, percentage: 100.0 }
                    },
                    children: [],
                    fileDetail: {
                      file: 'src/components/Modal/Modal.types.ts',
                      lines: { hit: 1, total: 2, percentage: 50.0 },
                      functions: { hit: 1, total: 1, percentage: 100.0 },
                      branches: { hit: 2, total: 2, percentage: 100.0 }
                    }
                  }
                ]
              }
            ]
          },
          {
            name: 'useValidation.ts',
            isDirectory: false,
            coverage: {
              lines: { hit: 3, total: 4, percentage: 75.0 },
              functions: { hit: 3, total: 3, percentage: 100.0 },
              branches: { hit: 2, total: 4, percentage: 50.0 }
            },
            children: [],
            fileDetail: {
              file: 'src/useValidation.ts',
              lines: { hit: 3, total: 4, percentage: 75.0 },
              functions: { hit: 3, total: 3, percentage: 100.0 },
              branches: { hit: 2, total: 4, percentage: 50.0 }
            }
          }
        ]
      }
    })

    describe('When generating markdown table', () => {
      let markdownTable: string

      beforeEach(() => {
        markdownTable = markdownGenerator.generateTable(directoryTree)
      })

      test('Then it should include proper table headers', () => {
        expect(markdownTable).toContain('| **File** | **Lines** | **Line %** | **Functions** | **Function %** |')
      })

      test('Then it should format files with proper indentation and file icon', () => {
        expect(markdownTable).toContain('| Button.tsx | 6/10 | 60.0% | 4/5 | 80.0% |')
        expect(markdownTable).toContain('| Modal.tsx | 12/24 | 50.0% | 7/10 | 70.0% |')
        expect(markdownTable).toContain('| Modal.types.ts | 1/2 | 50.0% | 1/1 | 100.0% |')
        expect(markdownTable).toContain('| useValidation.ts | 3/4 | 75.0% | 3/3 | 100.0% |')
      })

      test('Then it should maintain proper column alignment with padding', () => {
        const lines = markdownTable.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('---'))
        
        // Check file alignment
        const buttonFileLine = lines.find(line => line.includes('Button.tsx'))
        expect(buttonFileLine).toMatch(/Button\.tsx\s+\|\s+6\/10/)
      })

      test('Then it should preserve directory hierarchy order', () => {
        console.log(markdownTable);
        const tableLines = markdownTable.split('\n').filter(line => line.includes('.tsx') || line.includes('.ts'))
        const expectedOrder = [
          'Button.tsx',
          'Modal.tsx',
          'Modal.types.ts',
          'useValidation.ts'
        ]
        
        expectedOrder.forEach((item, index) => {
          expect(tableLines[index]).toContain(item)
        })
      })
    })
  })

  describe('Given an empty directory tree', () => {
    describe('When generating markdown table', () => {
      let markdownTable: string

      beforeEach(() => {
        markdownTable = markdownGenerator.generateTable(null)
      })

      test('Then it should return empty string', () => {
        expect(markdownTable).toBe('')
      })
    })
  })

  describe('Given a single file without directories', () => {
    let singleFileTree: DirectoryNode

    beforeEach(() => {
      singleFileTree = {
        name: 'utils.ts',
        isDirectory: false,
        coverage: {
          lines: { hit: 5, total: 10, percentage: 50.0 },
          functions: { hit: 2, total: 4, percentage: 50.0 },
          branches: { hit: 3, total: 6, percentage: 50.0 }
        },
        children: [],
        fileDetail: {
          file: 'utils.ts',
          lines: { hit: 5, total: 10, percentage: 50.0 },
          functions: { hit: 2, total: 4, percentage: 50.0 },
          branches: { hit: 3, total: 6, percentage: 50.0 }
        }
      }
    })

    describe('When generating markdown table', () => {
      let markdownTable: string

      beforeEach(() => {
        markdownTable = markdownGenerator.generateTable(singleFileTree)
      })

      test('Then it should format single file correctly', () => {
        expect(markdownTable).toContain('| utils.ts | 5/10 | 50.0% | 2/4 | 50.0% |')
      })
    })
  })
})
