import * as core from '@actions/core'
import * as github from '@actions/github'
import artifact from '@actions/artifact'
import { Context } from '@actions/github/lib/context'
import { CloverParser } from './CloverParser'
import { CoverageReporter } from './CoverageReporter'
import { GitHubService } from './GitHubService'
import { CoverageData, ActionInputs, CoverageReport } from './types'
import * as fs from 'fs'
import * as path from 'path'

export class PrTestCoverageAction {
  private static readonly DEFAULT_ARTIFACT_RETENTION_DAYS = 30
  
  private readonly inputs: ActionInputs
  private readonly context: Context
  private readonly githubService: GitHubService
  private readonly cloverParser: CloverParser
  private readonly coverageReporter: CoverageReporter

  constructor(inputs: ActionInputs, context: Context) {
    this.inputs = inputs
    this.context = context
    this.githubService = new GitHubService(inputs.githubToken, context)
    this.cloverParser = new CloverParser()
    this.coverageReporter = new CoverageReporter(inputs.allFilesMinimumCoverage, inputs.changedFilesMinimumCoverage)
  }

  async execute(): Promise<void> {
    core.info('Starting PR Test Coverage Action...')

    // Validate inputs
    this.validateInputs()

    // Validate that we're running in a PR context
    if (!this.context.payload.pull_request) {
      throw new Error('This action can only be run on pull request events')
    }

    // Change to working directory if specified
    if (this.inputs.workingDirectory) {
      process.chdir(this.inputs.workingDirectory)
      core.info(`Changed working directory to: ${this.inputs.workingDirectory}`)
    }

    // Parse Clover file
    const cloverPath = path.resolve(this.inputs.cloverFile)
    if (!fs.existsSync(cloverPath)) {
      throw new Error(`Clover file not found: ${cloverPath}`)
    }

    core.info(`Parsing Clover file: ${cloverPath}`)
    const coverageData = await this.cloverParser.parse(cloverPath)

    // Get changed files from PR
    core.info('Getting changed files from PR...')
    const changedFiles = await this.githubService.getChangedFiles()
    core.info(`Found ${changedFiles.length} changed files`)

    // Generate coverage report
    core.info('Generating coverage report...')
    const report = this.coverageReporter.generateReport(coverageData, changedFiles)

    // Check coverage thresholds
    this.checkCoverageThresholds(report)

    // Post or update PR comment
    core.info('Posting coverage report to PR...')
    const commentBody = this.coverageReporter.generateMarkdownReport(report)
    await this.githubService.postOrUpdateComment(commentBody, this.inputs.updateComment)

    // Upload artifact if requested
    if (this.inputs.artifactName) {
      core.info(`Uploading coverage artifact: ${this.inputs.artifactName}`)
      await this.uploadArtifact()
    }

    core.info('PR Test Coverage Action completed successfully!')
  }

  private validateInputs(): void {
    if (!this.inputs.cloverFile) {
      throw new Error('clover-file input is required')
    }
    
    if (!this.inputs.githubToken) {
      throw new Error('github-token input is required')
    }
    
    if (this.inputs.allFilesMinimumCoverage < 0 || this.inputs.allFilesMinimumCoverage > 100) {
      throw new Error('all-files-minimum-coverage must be between 0 and 100')
    }
    
    if (this.inputs.changedFilesMinimumCoverage < 0 || this.inputs.changedFilesMinimumCoverage > 100) {
      throw new Error('changed-files-minimum-coverage must be between 0 and 100')
    }
  }

  private checkCoverageThresholds(report: CoverageReport): void {
    // Check all files coverage threshold
    if (this.inputs.allFilesMinimumCoverage > 0) {
      const allFilesCoverage = report.allFiles.linesCoverage
      if (allFilesCoverage < this.inputs.allFilesMinimumCoverage) {
        throw new Error(
          `All files coverage (${allFilesCoverage.toFixed(1)}%) is below minimum threshold (${this.inputs.allFilesMinimumCoverage}%)`
        )
      }
    }

    // Check changed files coverage threshold
    if (this.inputs.changedFilesMinimumCoverage > 0) {
      const changedFilesCoverage = report.changedFiles.linesCoverage
      if (changedFilesCoverage < this.inputs.changedFilesMinimumCoverage) {
        throw new Error(
          `Changed files coverage (${changedFilesCoverage.toFixed(1)}%) is below minimum threshold (${this.inputs.changedFilesMinimumCoverage}%)`
        )
      }
    }
  }

  private async uploadArtifact(): Promise<void> {
    try {
      const files = [this.inputs.cloverFile]
      
      // Make artifact name unique to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const uniqueArtifactName = `${this.inputs.artifactName}-${timestamp}`
      
      const { id, size } = await artifact.uploadArtifact(
        uniqueArtifactName,
        files,
        process.cwd(), // rootDirectory
        {
          retentionDays: PrTestCoverageAction.DEFAULT_ARTIFACT_RETENTION_DAYS
        }
      )
      
      core.info(`Successfully uploaded artifact: ${uniqueArtifactName} (ID: ${id}, Size: ${size} bytes)`)
    } catch (error) {
      core.warning(`Failed to upload artifact: ${error}`)
    }
  }
}
