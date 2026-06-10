import path from 'path';
import { syncSecure } from './material_helpers';

const repoRoot = path.resolve(__dirname, '..');
process.chdir(repoRoot);

const main = async (): Promise<void> => {
    /** copy secure pages */
    await syncSecure();
};

main().catch((e: Error) => {
    console.error(e);
    process.exit(1);
});
