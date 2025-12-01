const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// name of your bucket here
const NAME_OF_BUCKET = "jair-bnb";

const multer = require("multer");

//  make sure to set environment variables in production for:
//  AWS_ACCESS_KEY_ID
//  AWS_SECRET_ACCESS_KEY
//  and aws will automatically use those environment variables

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1" 
});

// --------------------------- Public UPLOAD ------------------------

const singlePublicFileUpload = async (file) => {
  console.log('=== S3 UPLOAD START ===');
  console.log('File name:', file.originalname);
  console.log('File size:', file.size, 'bytes');
  console.log('File mimetype:', file.mimetype);
  console.log('AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
  console.log('AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
  console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
  console.log('Bucket:', NAME_OF_BUCKET);
  
  const { originalname, mimetype, buffer } = await file;
  const path = require("path");
  // name of the file in your S3 bucket will be the date in ms plus the extension name
  const Key = new Date().getTime().toString() + path.extname(originalname);
  console.log('S3 Key:', Key);
  
  const uploadParams = {
    Bucket: NAME_OF_BUCKET,
    Key,
    Body: buffer,
    ACL: "public-read",
  };
  
  console.log('Creating Upload instance...');
  const upload = new Upload({
    client: s3,
    params: uploadParams,
  });
  
  console.log('Starting upload...');
  try {
    const result = await upload.done();
    console.log('✅ Upload successful! Location:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('❌ Upload failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

const multiplePublicFileUpload = async (files) => {
  return await Promise.all(
    files.map((file) => {
      return singlePublicFileUpload(file);
    })
  );
};

// --------------------------- Prviate UPLOAD ------------------------

const singlePrivateFileUpload = async (file) => {
  const { originalname, mimetype, buffer } = await file;
  const path = require("path");
  // name of the file in your S3 bucket will be the date in ms plus the extension name
  const Key = new Date().getTime().toString() + path.extname(originalname);
  const uploadParams = {
    Bucket: NAME_OF_BUCKET,
    Key,
    Body: buffer,
  };
  
  const upload = new Upload({
    client: s3,
    params: uploadParams,
  });
  
  const result = await upload.done();

  // save the name of the file in your bucket as the key in your database to retrieve for later
  return result.Key;
};

const multiplePrivateFileUpload = async (files) => {
  return await Promise.all(
    files.map((file) => {
      return singlePrivateFileUpload(file);
    })
  );
};

const retrievePrivateFile = async (key) => {
  let fileUrl;
  if (key) {
    const command = new GetObjectCommand({
      Bucket: NAME_OF_BUCKET,
      Key: key,
    });
    fileUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  }
  return fileUrl || key;
};

// --------------------------- Storage ------------------------

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const singleMulterUpload = (nameOfKey) =>
  multer({ storage: storage }).single(nameOfKey);
const multipleMulterUpload = (nameOfKey) =>
  multer({ storage: storage }).array(nameOfKey);

module.exports = {
  s3,
  DeleteObjectCommand,
  singlePublicFileUpload,
  multiplePublicFileUpload,
  singlePrivateFileUpload,
  multiplePrivateFileUpload,
  retrievePrivateFile,
  singleMulterUpload,
  multipleMulterUpload,
};
