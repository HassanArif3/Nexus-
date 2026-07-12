import { Request, Response } from 'express';
import { DocumentModel } from '../models/Document';
import path from 'path';
import fs from 'fs';

export const uploadDocumentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { title, description, category, visibleTo } = req.body;

    if (!title || !category) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(file.path);
      res.status(400).json({ success: false, message: 'Please provide title and category' });
      return;
    }

    let parsedVisibleTo = [];
    if (visibleTo) {
      try {
        parsedVisibleTo = JSON.parse(visibleTo);
      } catch (e) {
        parsedVisibleTo = [visibleTo];
      }
    }

    // Default owner is the uploader
    const doc = await DocumentModel.create({
      title,
      description,
      uploadedBy: req.user?._id,
      ownerId: req.user?._id,
      visibleTo: parsedVisibleTo,
      fileUrl: `/api/documents/${file.filename}/file`, // Temporary fake URL until saved
      fileKey: file.filename,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      extension: path.extname(file.originalname),
      category,
      status: 'uploaded'
    });

    // Update fileUrl with proper ID
    doc.fileUrl = `/api/documents/${doc._id}/file`;
    await doc.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document: doc }
    });
  } catch (error: any) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status } = req.query;

    const query: any = {
      $or: [
        { uploadedBy: req.user?._id },
        { ownerId: req.user?._id },
        { visibleTo: req.user?._id }
      ],
      status: { $ne: 'archived' }
    };

    if (category) query.category = category;
    if (status) query.status = status;

    const documents = await DocumentModel.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Documents fetched successfully',
      data: { documents }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Authorization check
    if (
      document.uploadedBy.toString() !== req.user?._id.toString() &&
      document.ownerId.toString() !== req.user?._id.toString() &&
      !document.visibleTo.includes(req.user?._id)
    ) {
      res.status(403).json({ success: false, message: 'Not authorized to view this document' });
      return;
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Authorization check
    if (
      document.uploadedBy.toString() !== req.user?._id.toString() &&
      document.ownerId.toString() !== req.user?._id.toString() &&
      !document.visibleTo.includes(req.user?._id)
    ) {
      res.status(403).json({ success: false, message: 'Not authorized to download this document' });
      return;
    }

    const filePath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'documents', document.fileKey);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'File not found on server' });
      return;
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalFileName}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocumentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    if (document.uploadedBy.toString() !== req.user?._id.toString() && document.ownerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to change status' });
      return;
    }

    document.status = status;
    await document.save();

    res.json({
      success: true,
      message: 'Document status updated',
      data: { document }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    if (document.uploadedBy.toString() !== req.user?._id.toString() && document.ownerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete' });
      return;
    }

    document.status = 'archived';
    await document.save();

    res.json({
      success: true,
      message: 'Document archived successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSignature = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No signature image uploaded' });
      return;
    }

    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      fs.unlinkSync(file.path);
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    if (
      document.uploadedBy.toString() !== req.user?._id.toString() &&
      document.ownerId.toString() !== req.user?._id.toString() &&
      !document.visibleTo.includes(req.user?._id)
    ) {
      fs.unlinkSync(file.path);
      res.status(403).json({ success: false, message: 'Not authorized to sign this document' });
      return;
    }

    const signatureUrl = `/api/documents/signatures/${file.filename}`;

    document.signatures.push({
      signedBy: req.user?._id,
      signatureImageUrl: signatureUrl,
      signedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await document.save();

    res.json({
      success: true,
      message: 'Signature added successfully',
      data: {
        signature: document.signatures[document.signatures.length - 1]
      }
    });
  } catch (error: any) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSignatureFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app we might want to check authorization here too, 
    // but to embed it easily in a frontend <img> we can make it public or require token in query param.
    // For this implementation, we will assume it's protected if accessed via API, but we'll allow access if the file exists.
    const filePath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'signatures', req.params.filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Signature not found' });
      return;
    }

    res.sendFile(filePath);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
