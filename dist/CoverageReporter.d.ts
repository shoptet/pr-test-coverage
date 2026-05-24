import { CoverageData, CoverageReport, ChangedFile } from './types';
export declare class CoverageReporter {
    private readonly allFilesMinimumCoverage;
    private readonly changedFilesMinimumCoverage;
    private readonly allFilesCoverageVisible;
    constructor(allFilesMinimumCoverage?: number, changedFilesMinimumCoverage?: number, allFilesCoverageVisible?: boolean);
    generateReport(coverageData: CoverageData, changedFiles: ChangedFile[]): CoverageReport;
    generateMarkdownReport(report: CoverageReport): string;
    private calculateSummary;
    private getCoverageStatus;
}
