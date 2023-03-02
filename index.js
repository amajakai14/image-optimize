import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

import { GetObjectCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: "ap-northeast-1" });

const getObjectParam = {
  Bucket: "test-restaurant",
  Key: "my-kaki/1.jpg",
};
const getObjectCommand = new GetObjectCommand(getObjectParam);
let keyObject = await s3Client.send(getObjectCommand);
console.log(keyObject.Body.buffer);

if (!keyObject) {
  console.log("Image is undefined");
}

if (
  !keyObject.ContentType.includes("jpeg") &&
  !keyObject.ContentType.includes("png") &&
  !keyObject.ContentType.includes("webp")
) {
  console.log("not support image type");
}

fs.writeFileSync("1.webp", keyObject.Body.buffer);
