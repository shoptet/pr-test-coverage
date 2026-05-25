export interface ActionInputs {
    coverageFile: string;
    githubToken: string;
    workingDirectory: string;
    allFilesMinimumCoverage: number;
    changedFilesMinimumCoverage: number;
    artifactName: string;
    updateComment: boolean;
}
export interface FileCoverage {
    file: string;
    lines: {
        found: number;
        hit: number;
    };
    functions: {
        found: number;
        hit: number;
    };
    branches: {
        found: number;
        hit: number;
    };
}
export interface CoverageData {
    [filePath: string]: FileCoverage;
}
export interface CoverageSummary {
    linesTotal: number;
    linesHit: number;
    linesCoverage: number;
    functionsTotal: number;
    functionsHit: number;
    functionsCoverage: number;
    branchesTotal: number;
    branchesHit: number;
    branchesCoverage: number;
}
export interface CoverageReport {
    allFiles: CoverageSummary;
    changedFiles: CoverageSummary;
    fileDetails: Array<{
        file: string;
        lines: {
            hit: number;
            total: number;
            percentage: number;
        };
        functions: {
            hit: number;
            total: number;
            percentage: number;
        };
        branches: {
            hit: number;
            total: number;
            percentage: number;
        };
    }>;
}
export interface ChangedFile {
    filename: string;
    status: string;
}
