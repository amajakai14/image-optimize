import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import sharp from "sharp";

import { GetObjectCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: "ap-northeast-1" });

async function main() {
  try {
    const getObjectParam = {
      Bucket: "test-restaurant",
      Key: "my-kaki/1.jpg",
    };
    const getObjectCommand = new GetObjectCommand(getObjectParam);

    const response = await getObject("test-restaurant", "my-kaki/1.jpg");
    const bf = Buffer.concat(response);

    const resizedImage = await sharp(bf).resize(500, 500).webp().toBuffer();

    fs.writeFileSync("1.webp", resizedImage);
  } catch (err) {
    console.log(err);
  }
}
function getObject(Bucket, Key) {
  return new Promise(async (resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({ Bucket, Key });

    try {
      const response = await s3Client.send(getObjectCommand);

      // Store all of data chunks returned from the response data stream
      // into an array then use Array#join() to use the returned contents as a String
      let responseDataChunks = [];

      // Handle an error while streaming the response body
      response.Body.once("error", (err) => reject(err));

      // Attach a 'data' listener to add the chunks of data to our array
      // Each chunk is a Buffer instance
      response.Body.on("data", (chunk) => responseDataChunks.push(chunk));

      // Once the stream has no more data, join the chunks into a string and return the string
      response.Body.once("end", () => resolve(responseDataChunks.join("")));
    } catch (err) {
      // Handle the error or throw
      return reject(err);
    }
  });
}
await main();

// if (
//   !keyObject.ContentType.includes("jpeg") &&
//   !keyObject.ContentType.includes("png") &&
//   !keyObject.ContentType.includes("webp")
// ) {
//   console.log("not support image type");
// }

// fs.writeFileSync("1.webp", keyObject.Body.buffer);
