import {gunzipSync, unzipSync} from "node:zlib";


export function DecompressData(data_in_b64: string, type: 'gzip' | 'zip') {
    const decoded_buffer = Buffer.from(data_in_b64, 'base64');
    const unzipped = type == 'gzip' ? gunzipSync(decoded_buffer) : unzipSync(decoded_buffer);
    return JSON.parse(unzipped.toString('utf-8'));
}