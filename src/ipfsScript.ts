import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { CID } from "multiformats/cid";
import fs from "fs";
import path from "path";

async function initializeHelia() {
  const helia = await createHelia();
  const fsApi = unixfs(helia);
  return { helia, fsApi };
}

async function addFileToIpfs(fsApi: ReturnType<typeof unixfs>, filePath: string): Promise<CID> {
  console.log("Adding file to IPFS...");
  const file = fs.readFileSync(filePath);
  const cid = await fsApi.addBytes(file);
  console.log("File added to IPFS with CID:", cid.toString());
  return cid;
}

async function getFileFromIpfs(fsApi: ReturnType<typeof unixfs>, cid: CID, outputFilePath: string): Promise<void> {
  console.log("Retrieving file from IPFS...");
  const fileStream = fs.createWriteStream(outputFilePath);

  for await (const chunk of fsApi.cat(cid)) {
    fileStream.write(Buffer.from(chunk));
  }

  fileStream.close();
  console.log(`File retrieved from IPFS and saved to ${outputFilePath}`);
}

(async () => {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Please provide the input file path and output file path.");
    process.exit(1);
  }

  const inputFilePath = path.resolve(args[0]);
  const outputFilePath = path.resolve(args[1]);

  const { fsApi } = await initializeHelia();

  const cid = await addFileToIpfs(fsApi, inputFilePath);

  await getFileFromIpfs(fsApi, cid, outputFilePath);
})();
