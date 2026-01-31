const Contract = require('../models/Contract');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get Contract by ID
// @route   GET /api/contracts/:id
// @access  Private
exports.getContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('worker', 'name mobile')
            .populate('owner', 'name mobile companyName')
            .populate('job', 'title description location');

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        // Verify access
        if (contract.worker._id.toString() !== req.user.id && contract.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this contract' });
        }

        res.status(200).json({ success: true, data: contract });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Generate Contract PDF (Internal Use)
exports.generateContractPDF = async (contract, workerName, ownerName) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const filename = `contract-${contract._id}.pdf`;
            const uploadDir = path.join(__dirname, '../uploads/contracts');

            // Ensure dir exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // PDF Content
            doc.fontSize(25).text('OFFICIAL WORK CONTRACT', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`Contract ID: ${contract._id}`);
            doc.text(`Date: ${new Date().toDateString()}`);
            doc.moveDown();
            doc.text('---------------------------------------------------------');
            doc.moveDown();

            doc.fontSize(14).text('PARTIES INVOLVED:', { underline: true });
            doc.fontSize(12).text(`Worker (Majdoor): ${workerName}`);
            doc.text(`Job Provider (Owner): ${ownerName}`);
            doc.moveDown();

            doc.fontSize(14).text('JOB DETAILS:', { underline: true });
            doc.text(`Title: ${contract.job.title || 'Job Task'}`);
            doc.text(`Description: ${contract.job.description || 'N/A'}`);
            doc.text(`Agreed Wage/Amount: Rs. ${contract.amount}`);
            doc.moveDown();

            doc.fontSize(14).text('TERMS & CONDITIONS:', { underline: true });
            doc.text(contract.terms);
            doc.moveDown(2);

            doc.text('This contract is legally binding and generated automatically by Majdoor Platform.');
            doc.text('Both parties have digitally consented to these terms via the application.');

            doc.end();

            stream.on('finish', () => {
                resolve(`/uploads/contracts/${filename}`);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
};
