import fs from 'fs';
import path from 'path';
import Rsync from 'rsync';
import yaml from 'js-yaml';

type RsyncInstance = InstanceType<typeof Rsync>;

export interface SyncConfig {
    from: string;
    to: string;
    ignore: string[];
    open?: boolean;
}

export type ConfigEntry = string | SyncConfig;

export interface ConfigType {
    [key: string]: ConfigEntry[];
}

const materialConfigPath = path.resolve(__dirname, '..', 'material_config.yaml');

export const loadMaterialConfig = (): ConfigType => {
    const source = fs.readFileSync(materialConfigPath, 'utf-8');
    return (yaml.load(source) ?? {}) as ConfigType;
};

export const saveMaterialConfig = (config: ConfigType): void => {
    fs.writeFileSync(
        materialConfigPath,
        yaml.dump(config, {
            noRefs: true,
            lineWidth: -1,
            sortKeys: false
        })
    );
};

/**
 * Ensure rsync sync completes successfully, retrying on failure
 */
export const ensureSync = async (rsync: RsyncInstance, srcPath: string): Promise<boolean> => {
    let success = false;
    while (!success) {
        const rs = new Promise<boolean>((resolve) => {
            rsync.execute((err: Error | null, code: number, cmd: string) => {
                if (!err) {
                    console.log('✅', cmd);
                    resolve(true);
                } else {
                    console.log('❌', srcPath);
                    console.log('   ', cmd);
                    console.log('   ', err);
                    console.log('   ', code);
                    console.log('');
                    resolve(false);
                }
            });
        });
        success = await rs;
    }
    return success;
};

/**
 * Sync secure pages and static files
 */
export const syncSecure = async (): Promise<void> => {
    const projectRoot = process.cwd();

    /** copy secure pages */
    const securePages = path.join(projectRoot, 'secure/sync/pages/');
    if (fs.existsSync(securePages)) {
        const rsync = new Rsync().source(securePages).destination('src/pages/secure').archive().delete();
        await ensureSync(rsync, securePages);
    }
    /** secure static */
    const secureStatic = path.join(projectRoot, 'secure/sync/static/');
    if (fs.existsSync(secureStatic)) {
        const rsync = new Rsync().source(secureStatic).destination('static/secure').archive().delete();
        await ensureSync(rsync, secureStatic);
    }
};
