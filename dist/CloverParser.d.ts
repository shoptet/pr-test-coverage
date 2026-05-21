import { CoverageData } from './types';
export declare class CloverParser {
    parse(cloverFilePath: string): Promise<CoverageData>;
}
