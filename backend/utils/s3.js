const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME;

function objectKey(entryId, field) {
  const fieldMap = {
    cegRegularStatus: 'ceg-regular',
    cegArrearStatus: 'ceg-arrear',
    mitRegularStatus: 'mit-regular',
    mitArrearStatus: 'mit-arrear',
  };
  return `student-inputs/${entryId}/${fieldMap[field] || field}.xlsx`;
}

async function uploadFile(entryId, field, fileBuffer) {
  const key = objectKey(entryId, field);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }));
  return key;
}

async function getFileStream(entryId, field) {
  const key = objectKey(entryId, field);
  const { Body } = await s3.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
  return Body;
}

async function getFileBuffer(entryId, field) {
  const stream = await getFileStream(entryId, field);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = { uploadFile, getFileStream, getFileBuffer, objectKey };