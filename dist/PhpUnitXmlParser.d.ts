import { CoverageData } from './types';
export declare class PhpUnitXmlParser {
    parse(coverageXmlDir: string): Promise<CoverageData>;
    /**
     * Extracts the source file path from a PHPUnit XML file
     * This reads the individual file XML to get the path attribute
     */
    private extractSourcePath;
}
