import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';

async function initializeHelia() {
  const helia = await createHelia();
  const fs = unixfs(helia);
  return { helia, fs };
}

async function addDataToIpfs(fs: ReturnType<typeof unixfs>, data: string): Promise<CID> {
  const cid = await fs.addBytes(new TextEncoder().encode(data));
  console.log('Data added to IPFS with CID:', cid.toString());
  return cid;
}

async function getDataFromIpfs(fs: ReturnType<typeof unixfs>, cid: CID): Promise<void> {
  const decoder = new TextDecoder();
  let data = '';

  for await (const chunk of fs.cat(cid)) {
    data += decoder.decode(chunk);
  }

  console.log('Data retrieved from IPFS:', data);
}

(async () => {
  const { fs } = await initializeHelia();

  const cid = await addDataToIpfs(fs, 'Hello, IPFS from Helia!');

  await getDataFromIpfs(fs, cid);
})();