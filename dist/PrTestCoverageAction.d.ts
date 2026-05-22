import { Context } from '@actions/github/lib/context';
import { ActionInputs } from './types';
export declare class PrTestCoverageAction {
    private static readonly DEFAULT_ARTIFACT_RETENTION_DAYS;
    private readonly inputs;
    private readonly context;
    private readonly githubService;
    private readonly cloverParser;
    private readonly coverageReporter;
    constructor(inputs: ActionInputs, context: Context);
    execute(): Promise<void>;
    private validateInputs;
    private checkCoverageThresholds;
    private logCoverageReport;
    private uploadArtifact;
}
