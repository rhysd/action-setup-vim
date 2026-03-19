import { strict as A } from 'node:assert';
import { createHash } from 'node:crypto';
import * as path from 'node:path';
import { Response } from 'node-fetch';
import esmock from 'esmock';
import { TESTDATA_PATH } from './helper.js';

const CHECKSUM_DIR = path.join(TESTDATA_PATH, 'checksum');
const DUMMY_FILE = path.join(CHECKSUM_DIR, 'dummy.txt');
const MISMATCH_FILE = path.join(CHECKSUM_DIR, 'mismatch.txt');
const SLUG = 'neovim/neovim';
const TAG = 'nightly';
const ASSET = 'nvim-linux-x86_64.tar.gz';
const API_URL = `https://api.github.com/repos/${SLUG}/releases/tags/${TAG}`;

function sha256Hex(text: string): string {
    return createHash('sha256').update(text).digest('hex');
}

function fetchMockForApi(data: { assets?: Array<{ name?: string; digest?: string }> } | null): (url: string) => Promise<Response> {
    return async (url: string): Promise<Response> => {
        if (url === API_URL) {
            if (data === null) {
                return new Response('not found', { status: 404, statusText: 'Not found' });
            }
            return new Response(JSON.stringify(data), { status: 200, statusText: 'OK' });
        }
        return new Response('not found', { status: 404, statusText: 'Not found' });
    };
}

describe('verifySha256IfAvailable()', function () {
    it('does nothing when digest matches', async function () {
        const digest = sha256Hex('dummy asset response');
        const fetchMock = fetchMockForApi({ assets: [{ name: ASSET, digest }] });
        const { verifySha256IfAvailable } = await esmock('../src/checksum.js', {}, { 'node-fetch': { default: fetchMock } });
        await verifySha256IfAvailable(DUMMY_FILE, SLUG, TAG, ASSET);
    });

    it('throws when digest mismatches', async function () {
        const fetchMock = fetchMockForApi({ assets: [{ name: ASSET, digest: 'deadbeef' }] });
        const { verifySha256IfAvailable } = await esmock('../src/checksum.js', {}, { 'node-fetch': { default: fetchMock } });
        await A.rejects(() => verifySha256IfAvailable(MISMATCH_FILE, SLUG, TAG, ASSET), /SHA256 mismatch/);
    });

    it('does nothing when digest is missing', async function () {
        const fetchMock = fetchMockForApi({ assets: [{ name: ASSET }] });
        const { verifySha256IfAvailable } = await esmock('../src/checksum.js', {}, { 'node-fetch': { default: fetchMock } });
        await verifySha256IfAvailable(DUMMY_FILE, SLUG, TAG, ASSET);
    });

    it('does nothing when API returns 404', async function () {
        const fetchMock = fetchMockForApi(null);
        const { verifySha256IfAvailable } = await esmock('../src/checksum.js', {}, { 'node-fetch': { default: fetchMock } });
        await verifySha256IfAvailable(DUMMY_FILE, SLUG, TAG, ASSET);
    });
});
