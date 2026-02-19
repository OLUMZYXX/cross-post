import mongoose from "mongoose";
import { Readable } from "stream";

let bucket;

export function getGridFSBucket() {
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "media",
    });
  }
  return bucket;
}

/**
 * Upload a file buffer to GridFS.
 * Returns the stored file's ObjectId and a URL path to retrieve it.
 */
export function uploadToGridFS(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const b = getGridFSBucket();
    const readStream = Readable.from(buffer);
    const uploadStream = b.openUploadStream(filename, {
      contentType,
    });

    readStream
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve({
          fileId: uploadStream.id,
          filename: uploadStream.filename,
        });
      });
  });
}

/**
 * Stream a file from GridFS by its ObjectId.
 */
export function downloadFromGridFS(fileId) {
  const b = getGridFSBucket();
  const objectId =
    typeof fileId === "string"
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;
  return b.openDownloadStream(objectId);
}

/**
 * Find file metadata by ObjectId.
 */
export async function findFileById(fileId) {
  const b = getGridFSBucket();
  const objectId =
    typeof fileId === "string"
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;
  const files = await b.find({ _id: objectId }).toArray();
  return files[0] || null;
}

/**
 * Delete a file from GridFS by its ObjectId.
 */
export async function deleteFromGridFS(fileId) {
  const b = getGridFSBucket();
  const objectId =
    typeof fileId === "string"
      ? new mongoose.Types.ObjectId(fileId)
      : fileId;
  await b.delete(objectId);
}
