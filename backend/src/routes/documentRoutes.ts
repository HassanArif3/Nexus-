import express from 'express';
import { 
  uploadDocumentHandler, getDocuments, getDocumentMetadata, 
  getDocumentFile, updateDocumentStatus, deleteDocument, 
  addSignature, getSignatureFile 
} from '../controllers/documentController';
import { protect } from '../middleware/authMiddleware';
import { uploadDocument, uploadSignature } from '../middleware/uploadMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(uploadDocument.single('file'), uploadDocumentHandler)
  .get(getDocuments);

router.route('/:id')
  .get(getDocumentMetadata)
  .delete(deleteDocument);

router.get('/:id/file', getDocumentFile);
router.get('/:id/preview', getDocumentFile); // Alias for preview

router.patch('/:id/status', updateDocumentStatus);

router.post('/:id/signatures', uploadSignature.single('signatureImage'), addSignature);

// The getSignatureFile can be accessed via /api/documents/signatures/:filename
router.get('/signatures/:filename', getSignatureFile);

export default router;
