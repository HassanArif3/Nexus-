import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directories exist
const createDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const docUploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'documents');
const sigUploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'signatures');

createDir(docUploadDir);
createDir(sigUploadDir);

// Document upload config
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, XLSX, and PPTX are allowed.'));
  }
};

export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Signature upload config
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sigUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const signatureFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image type. Only JPG, PNG, and WEBP are allowed.'));
  }
};

export const uploadSignature = multer({
  storage: signatureStorage,
  fileFilter: signatureFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});
