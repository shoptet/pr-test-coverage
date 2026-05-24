import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { ChangedFile } from './types'

export class GitHubService {
  private static readonly FILES_PER_PAGE = 100
  private static readonly COMMENTS_PER_PAGE = 100

  private readonly octokit: ReturnType<typeof github.getOctokit>
  private readonly context: Context
  private readonly commentIdentifier = '<!-- PR Test Coverage Report -->'
  private readonly testChangedFiles: string

  constructor(githubToken: string, context: Context, testChangedFiles: string = '') {
    this.octokit = github.getOctokit(githubToken)
    this.context = context
    this.testChangedFiles = testChangedFiles
  }

  async getChangedFiles(): Promise<ChangedFile[]> {
    // If test mode is enabled, return mock changed files
    if (this.testChangedFiles) {
      const files = this.testChangedFiles.split(',').map(filename => filename.trim()).filter(f => f)
      core.info(`TEST MODE: Using mocked changed files: ${files.join(', ')}`)
      return files.map(filename => ({
        filename,
        status: 'modified'
      }))
    }

    const pullRequest = this.context.payload.pull_request
    if (!pullRequest) {
      throw new Error('No pull request found in context')
    }

    try {
      // Fetch all changed files with pagination
      const allFiles = []
      let page = 1
      const perPage = GitHubService.FILES_PER_PAGE
      
      while (true) {
        const { data: files } = await this.octokit.rest.pulls.listFiles({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          pull_number: pullRequest.number,
          per_page: perPage,
          page: page
        })
        
        if (files.length === 0) {
          break
        }
        
        allFiles.push(...files)
        
        // If we got fewer files than the page size, we've reached the end
        if (files.length < perPage) {
          break
        }
        
        page++
      }

      return allFiles.map(file => ({
        filename: file.filename,
        status: file.status
      }))
    } catch (error) {
      core.error(`Failed to get changed files: ${error}`)
      throw new Error(`Failed to get changed files: ${error}`)
    }
  }

  async postOrUpdateComment(commentBody: string, shouldUpdate: boolean): Promise<void> {
    const pullRequest = this.context.payload.pull_request
    if (!pullRequest) {
      throw new Error('No pull request found in context')
    }

    const fullCommentBody = `${this.commentIdentifier}\n${commentBody}`

    try {
      if (shouldUpdate) {
        // Try to find and update existing comment
        const existingComment = await this.findExistingComment()
        if (existingComment) {
          await this.octokit.rest.issues.updateComment({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            comment_id: existingComment.id,
            body: fullCommentBody
          })
          core.info(`Updated existing comment (ID: ${existingComment.id})`)
          return
        }
      }

      // Create new comment
      await this.octokit.rest.issues.createComment({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: pullRequest.number,
        body: fullCommentBody
      })
      core.info('Created new comment')
    } catch (error) {
      core.error(`Failed to post/update comment: ${error}`)
      throw new Error(`Failed to post/update comment: ${error}`)
    }
  }

  private async findExistingComment(): Promise<{ id: number } | null> {
    const pullRequest = this.context.payload.pull_request
    if (!pullRequest) {
      return null
    }

    try {
      // Search through comments with pagination to handle PRs with many comments
      let page = 1
      const perPage = GitHubService.COMMENTS_PER_PAGE
      
      while (true) {
        const { data: comments } = await this.octokit.rest.issues.listComments({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          issue_number: pullRequest.number,
          per_page: perPage,
          page: page
        })
        
        if (comments.length === 0) {
          break
        }
        
        const existingComment = comments.find(comment => 
          comment.body?.includes(this.commentIdentifier)
        )
        
        if (existingComment) {
          return { id: existingComment.id }
        }
        
        // If we got fewer comments than the page size, we've reached the end
        if (comments.length < perPage) {
          break
        }
        
        page++
      }

      return null
    } catch (error) {
      core.warning(`Failed to find existing comment: ${error}`)
      return null
    }
  }
}
