import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import logger from "./middleware/logger.js";
import path from "path";
import formidable from "formidable";
import fs from "fs";
const app = express();
app.use(express.json());
dotenv.config();
const port = process.env.PORT;

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
app.post("/upload_mult", upload.single("file"), (req, res, _next) => {
  res.json({ filename: req.file.originalname, fildes: req.body });
});

app.listen(port, () => {
  logger.info(`server running on port http://localhost${port}`);
});
