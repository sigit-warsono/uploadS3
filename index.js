const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s2Client = new S3Client({
  region: "auto",
  endpoint: `https://bce891d8629985ff3526972b74cbc127.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: "4b1d6a993d38edc7563ba94a1a406973",
    secretAccessKey:
      "c72a44c7cb0c7e270697739783061fb559356fc19acfb1f8dae987544141697f",
  },
  signatureVersion: "v4",
});
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static("public"));

async function getObjectURL(key) {
  const params = {
    Bucket: "edutech",
    Key: key,
  };

  const url = getSignedUrl(s2Client, new GetObjectCommand(params));
  return url;
}

async function putObject(filename, contentType, buffer) {
  const params = new PutObjectCommand({
    Bucket: "edutech",
    Key: filename,
    ACL: "public-read",
    Body: buffer,
    ContentType: contentType,
  });
  const url = await s2Client.send(params);
  return url;
}

app.get("/", async (req, res) => {
  let imageurl = getObjectURL("Video_Compro.mp4");
  imageurl
    .then((url) => {
      res.send(url);
      console.log(url);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/send-file", upload.single("file"), async (req, res) => {
  console.log(req.file);
  let url = await putObject(
    req.file.originalname,
    req.file.mimetype,
    req.file.buffer
  );
  console.log(url);
  res.send("success");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
