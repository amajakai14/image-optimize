import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
const s3Client = new S3Client({ region: "ap-northeast-1" });
export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  console.log("bucket: ", bucket, "key: ", key);

  if (bucket.endsWith("-resized")) {
    return "Recursive occuring please check bucket";
  }
  const getObjectParam = {
    Bucket: bucket,
    Key: key,
  };
  const getObjectCommand = new GetObjectCommand(getObjectParam);
  let response = await s3Client.send(getObjectCommand);

  if (!response) {
    return "Image is undefined";
  }

  if (
    !response.ContentType.includes("jpeg") &&
    !response.ContentType.includes("png") &&
    !response.ContentType.includes("webp")
  ) {
    return "not support image type";
  }

  try {
    const image = await buffer(response.Body);

    const resizedImage = await sharp(image).resize(500, 500).webp().toBuffer();

    const blurredImage = await sharp(resizedImage).blur(80).toBuffer();
    const contentType = "image/webp";

    const destinationBucket = bucket + "-resized";
    const resizedImagePayload = {
      Bucket: destinationBucket,
      Key: key + "-resize",
      Body: resizedImage,
      ContentType: contentType,
      ContentLength: resizedImage.length,
    };

    const blurredImagePayload = {
      Bucket: destinationBucket,
      Key: key + "-blur",
      Body: blurredImage,
      ContentType: contentType,
      ContentLength: resizedImage.length,
    };
    const resizeCommand = new PutObjectCommand(resizedImagePayload);
    const blurCommand = new PutObjectCommand(blurredImagePayload);
    await s3Client.send(resizeCommand);
    await s3Client.send(blurCommand);
    return "resized and blurred image job done";
  } catch (err) {
    console.log(err);
    return err;
  }
};
