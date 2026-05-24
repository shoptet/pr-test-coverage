# PR Test Coverage

A Github Action to report the test coverage of changed files in a pull request. It uses PHPUnit XML coverage format. It provides a summary of the coverage for all files and changed files separately, and a detailed table with coverage metrics per changed file.

<img width="924" height="761" alt="image" src="https://github.com/user-attachments/assets/d0e61fa6-46c6-40b1-b9ce-b3c71a10321b" />

## Features

- 📊 Generates comprehensive coverage reports from PHPUnit XML coverage format
- 💬 Posts coverage summaries as PR comments
- 🔄 Updates existing comments or creates new ones
- 📈 Shows coverage for all files and changed files separately
- 📋 Detailed table with coverage metrics per changed file
- ⚠️ Configurable coverage thresholds with action failure
- 📦 Optional artifact upload for coverage reports
- 🎯 Supports custom working directories

## Usage

### Basic Usage

```yaml
name: Test Coverage
on:
  pull_request:
    branches: [ main ]

jobs:
  coverage:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests and generate coverage
        run: |
          # Your test commands here that generate PHPUnit XML coverage report
          vendor/bin/phpunit --coverage-xml coverage-xml

      - name: PR Test Coverage
        uses: jbaczuk/pr-test-coverage@v1
        with:
          coverage-xml-dir: coverage-xml
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Advanced Usage

```yaml
- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    # Required: Path to PHPUnit XML coverage directory
    coverage-xml-dir: coverage-xml

    # Required: GitHub token for API access
    github-token: ${{ secrets.GITHUB_TOKEN }}
    
    # Optional: Working directory (default: repository root)
    working-directory: ./my-app
    
    # Optional: Minimum coverage for all files (default: 0)
    all-files-minimum-coverage: 80
    
    # Optional: Minimum coverage for changed files (default: 0)
    changed-files-minimum-coverage: 90
    
    # Optional: Upload coverage as artifact (default: empty/disabled)
    artifact-name: coverage-report
    
    # Optional: Update existing comment vs create new (default: true)
    update-comment: true
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `coverage-xml-dir` | Path to the PHPUnit XML coverage directory (e.g., `coverage-xml`) | ✅ | - |
| `github-token` | GitHub token for API access and posting comments | ✅ | `${{ github.token }}` |
| `working-directory` | Working directory to run the action from | ❌ | `''` (repository root) |
| `all-files-minimum-coverage` | Minimum coverage percentage for all files (0-100) | ❌ | `0` |
| `changed-files-minimum-coverage` | Minimum coverage percentage for changed files (0-100) | ❌ | `0` |
| `artifact-name` | Name for coverage artifact upload (empty to skip) | ❌ | `''` |
| `update-comment` | Whether to update existing comment or create new one | ❌ | `true` |

## Outputs

The action provides the following outputs that can be used in subsequent workflow steps:

| Output | Description |
|--------|-------------|
| `all-files-coverage` | Overall line coverage percentage for all files |
| `changed-files-coverage` | Line coverage percentage for changed files |
| `all-files-lines-hit` | Number of lines covered in all files |
| `all-files-lines-total` | Total number of lines in all files |
| `changed-files-lines-hit` | Number of lines covered in changed files |
| `changed-files-lines-total` | Total number of lines in changed files |

### Using Outputs

```yaml
- name: PR Test Coverage
  id: coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    coverage-xml-dir: coverage-xml
    github-token: ${{ secrets.GITHUB_TOKEN }}

- name: Check coverage threshold
  run: |
    echo "Coverage: ${{ steps.coverage.outputs.all-files-coverage }}%"
    if (( $(echo "${{ steps.coverage.outputs.all-files-coverage }} < 80" | bc -l) )); then
      echo "Warning: Coverage is below 80%"
    fi
```

## Required Permissions

The action requires the following permissions in your workflow:

```yaml
permissions:
  contents: read        # To access repository files
  pull-requests: write  # To post and update PR comments
```

## Example Output

The action will post a comment on your pull request that looks like this:

> ## Coverage Report ⚠️
> 
> ### All Files
> - Lines: 847/1205 (70.3%) ⚠️
> - Functions: 156/198 (78.8%)
> - Branches: 234/298 (78.5%)
> 
> ### Changed Files
> - Lines: 142/165 (86.1%) ✅
> - Functions: 28/32 (87.5%)
> - Branches: 45/52 (86.5%)
> 
> Files changed:
> 
> | **File** | **Lines** | **Line %** | **Functions** | **Function %** | **Branches** | **Branch %** |
> |------|-------|--------|-----------|------------|----------|----------|
> | **📁 src**                                        | **142/165** | **86.1%** | **28/32** | **87.5%** | **45/52** | **86.5%** |
> | **&emsp; 📁 components**                          | **69/80** | **86.3%** | **12/14** | **85.7%** | **20/25** | **80.0%** |
> | **&emsp;&emsp;&nbsp; 📁 Button**                  | **24/28** | **85.7%** | **4/5** | **80.0%** | **8/10** | **80.0%** |
> | &emsp;&emsp;&emsp;&nbsp;&nbsp; 📄 Button.tsx      | 24/28 | 85.7% | 4/5 | 80.0% | 8/10 | 80.0% |
> | **&emsp;&emsp;&nbsp; 📁 Modal**                   | **45/52** | **86.5%** | **8/9** | **88.9%** | **12/15** | **80.0%** |
> | &emsp;&emsp;&emsp;&nbsp;&nbsp; 📄 Modal.tsx       | 45/52 | 86.5% | 8/9 | 88.9% | 12/15 | 80.0% |
> | **&emsp; 📁 hooks**                               | **32/35** | **91.4%** | **6/7** | **85.7%** | **10/12** | **83.3%** |
> | &emsp;&emsp;&nbsp; 📄 useAuth.ts                  | 32/35 | 91.4% | 6/7 | 85.7% | 10/12 | 83.3% |
> | **&emsp; 📁 services**                            | **28/32** | **87.5%** | **7/8** | **87.5%** | **11/13** | **84.6%** |
> | **&emsp;&emsp;&nbsp; 📁 api**                     | **28/32** | **87.5%** | **7/8** | **87.5%** | **11/13** | **84.6%** |
> | &emsp;&emsp;&emsp;&nbsp;&nbsp; 📄 userService.ts  | 28/32 | 87.5% | 7/8 | 87.5% | 11/13 | 84.6% |
> | **&emsp; 📁 utils**                               | **13/18** | **72.2%** | **3/3** | **100.0%** | **4/2** | **66.7%** |
> | &emsp;&emsp;&nbsp; 📄 validation.ts               | 13/18 | 72.2% | 3/3 | 100.0% | 4/2 | 66.7% |

## Coverage Status Icons

The action uses visual indicators to quickly show coverage status:

- ✅ **Good coverage** (≥80%)
- ⚠️ **Moderate coverage** (60-79%)
- ❌ **Low coverage** (<60%)

## Failure Conditions

The action will fail if:

1. **Coverage XML directory not found** - The specified PHPUnit XML coverage directory doesn't exist
2. **Not a pull request** - The action is not running in a PR context
3. **Coverage below threshold** - When coverage falls below specified minimums:
   - All files coverage below `all-files-minimum-coverage`
   - Changed files coverage below `changed-files-minimum-coverage`

## Supported PHPUnit XML Format

The action supports PHPUnit XML coverage format (generated with `--coverage-xml`) with the following metrics:

- **Lines**: `executable` (total lines) and `executed` (lines hit)
- **Methods**: `count` (total methods) and `tested` (methods hit)
- **Functions**: `count` (total functions) and `tested` (functions hit)

## Common Integration Examples

### Node.js with Jest

```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests with coverage
  run: npm test -- --coverage --coverageReporters=clover

- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    coverage-xml-dir: coverage/clover.xml
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Note: Jest generates Clover format, not PHPUnit XML. This action now primarily supports PHPUnit XML format. For Jest, you may need to convert the format or use a different action.

### Python with pytest-cov

```yaml
- name: Install dependencies
  run: |
    pip install pytest pytest-cov

- name: Run tests with coverage
  run: pytest --cov=. --cov-report=xml

- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    coverage-xml-dir: coverage.xml
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Note: pytest-cov generates Cobertura XML format, not PHPUnit XML. This action now primarily supports PHPUnit XML format.

### PHP with PHPUnit

```yaml
- name: Run tests with coverage
  run: |
    vendor/bin/phpunit --coverage-xml coverage-xml

- name: PR Test Coverage
  uses: jbaczuk/pr-test-coverage@v1
  with:
    coverage-xml-dir: coverage-xml
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
