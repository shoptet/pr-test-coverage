import * as core from '@actions/core'
import * as github from '@actions/github'
import { PrTestCoverageAction } from './PrTestCoverageAction'

async function run(): Promise<void> {
  try {
    const inputs = {
      coverageXmlDir: core.getInput('coverage-xml-dir', { required: true }),
      githubToken: core.getInput('github-token', { required: true }),
      workingDirectory: core.getInput('working-directory'),
      allFilesMinimumCoverage: parseInt(core.getInput('all-files-minimum-coverage') || '0', 10),
      changedFilesMinimumCoverage: parseInt(core.getInput('changed-files-minimum-coverage') || '0', 10),
      artifactName: core.getInput('artifact-name'),
      updateComment: core.getInput('update-comment').toLowerCase() === 'true',
      reportTitle: core.getInput('report-title') || 'PR Test Coverage Report'
    }

    const action = new PrTestCoverageAction(inputs, github.context)
    await action.execute()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    core.setFailed(errorMessage)
  }
}

run()
