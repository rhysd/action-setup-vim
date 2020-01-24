// import * as core from '@actions/core';
import { Config } from './config';

export interface Installed {
    executable: string;
}

export async function install(config: Config): Promise<Installed> {
    throw new Error(`Not implemented: ${JSON.stringify(config)}`);
}
