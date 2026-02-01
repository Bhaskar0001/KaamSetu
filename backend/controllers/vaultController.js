const fs = require('fs');
const path = require('path');
const { encryptBuffer, decryptBuffer } = require('../utils/encryption');
const AuditService = require('../services/AuditService');

// Secure Upload (Encrypts on the fly)
exports.uploadSecure = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // 1. Encrypt buffer
        const encryptedData = encryptBuffer(req.file.buffer);

        // 2. Generate filename
        const filename = `secure-${Date.now()}-${Math.round(Math.random() * 1E9)}.enc`;
        const filePath = path.join(__dirname, '../secure_uploads', filename);

        // 3. Write to disk
        fs.writeFileSync(filePath, encryptedData);

        // 4. Audit Log
        await AuditService.logEvent('SECURE_UPLOAD', req.user, {
            originalName: req.file.originalname,
            secureFilename: filename
        }, req);

        res.status(201).json({
            success: true,
            data: {
                filename,
                originalName: req.file.originalname
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Secure Upload Failed' });
    }
};

// Secure Stream (Decrypts on the fly)
exports.streamSecure = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../secure_uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // 1. Read Encrypted
        const encryptedContent = fs.readFileSync(filePath, 'utf8');

        // 2. Decrypt
        const decryptedBuffer = decryptBuffer(encryptedContent);

        // 3. Audit Log (Access Control)
        await AuditService.logEvent('VAULT_ACCESS', req.user, { filename }, req);

        // 4. Send
        res.setHeader('Content-Type', 'image/jpeg'); // Assuming images for now
        res.send(decryptedBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Access Denied' });
    }
};
