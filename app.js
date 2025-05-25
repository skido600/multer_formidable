import express from "express";
import multer from "multer";

import logger from "./middleware/logger.js";
import path from "path";
import formidable from "formidable";
import fs from "fs";

const app = express();
import { port, cloudinary } from "./config/config.js";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//using formidable to handle formdata by leo
app.post("/upload", async (req, res, next) => {
  const dir = path.join(process.cwd(), "upload_test");
  //   try {
  //     await fs.open(dir);
  //     console.log("folder exists");
  //   } catch (error) {
  //     if (error.code == "ENOENT") {
  //       await fs.mkdir(dir);
  //     }
  //   }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const form = formidable({
    uploadDir: dir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
    }

    res.json({
      field: fields,
      file: files.file[0].filepath,
    });
  });
});

// using multer to handle formdata
const dir2 = path.join(process.cwd(), "upload_2");
if (!fs.existsSync(dir2)) {
  fs.mkdirSync(dir2);
}
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, dir2);
  },
  filename: function (_req, file, cb) {
    cb(null, `upload_${Date.now()}_${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });
app.post("/upload_mult", upload.single("file"), async (req, res, _next) => {
  const { fname } = req.body;
  const filepath = req.file.path;
  try {
    // const result = storage_cloud.uploader.upload(filepath, {
    //   folder: "IMAGES_UPLOADS",
    //   resource_type: "image",
    // });
    const result = await cloudinary.uploader.upload(filepath, {
      folder: "image_upload",
      resource_type: "image",
    });
    res.json({
      uploaded: true,
      message: "upload successfuly",
      data: [fname, result.url],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ uploaded: false, message: error.message });
  } finally {
    // fs.unlinkSync(filepath);
    fs.unlink(filepath, (err) => {
      if (err) {
        console.log(err);
      }
      console.log("delected succesfully");
    });
  }
});

app.listen(port, () => {
  logger.info(`server running on port http://localhost${port}`);
});
