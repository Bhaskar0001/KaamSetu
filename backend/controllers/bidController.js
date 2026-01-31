const Bid = require('../models/Bid');
const Job = require('../models/Job');

// @desc    Place a bid on a job
// @route   POST /api/bids/:jobId
// @access  Private (Worker)
exports.placeBid = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.jobType === 'direct') {
            return res.status(400).json({ success: false, message: 'Cannot bid on direct hire jobs' });
        }

        const bid = await Bid.create({
            job: req.params.jobId,
            worker: req.user.id,
            amount: req.body.amount,
        });

        res.status(201).json({ success: true, data: bid });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get bids for a job
// @route   GET /api/bids/:jobId
// @access  Private (Owner/Thekedar)
exports.getJobBids = async (req, res) => {
    try {
        const bids = await Bid.find({ job: req.params.jobId }).populate('worker', 'name skills experience profileImage');
        res.status(200).json({ success: true, data: bids });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Accept a bid
// @route   PUT /api/bids/:bidId/accept
// @access  Private (Owner)
const Contract = require('../models/Contract');
const { generateContractPDF } = require('./contractController');
const User = require('../models/User');

// @desc    Accept a bid
// @route   PUT /api/bids/:bidId/accept
// @access  Private (Owner)
exports.acceptBid = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.bidId)
            .populate('job')
            .populate('worker');

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        // Verify job belongs to user
        if (bid.job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        bid.status = 'accepted';
        await bid.save();

        // Update job status
        await Job.findByIdAndUpdate(bid.job._id, { status: 'assigned' });

        // --- AUTO CONTRACT GENERATION ---
        const owner = await User.findById(req.user.id);

        try {
            const newContract = await Contract.create({
                job: bid.job._id,
                worker: bid.worker._id,
                owner: owner._id,
                amount: bid.amount, // Final agreed amount
                status: 'active'
            });

            // Generate PDF
            const pdfPath = await generateContractPDF(newContract, bid.worker.name, owner.name);

            newContract.pdfPath = pdfPath;
            await newContract.save();

            console.log(`Contract Generated: ${newContract._id}`);
        } catch (contractErr) {
            console.error('Contract Generation Failed:', contractErr.message);
            // Don't fail the request, just log it. Contract can be regenerated later manually if needed.
        }
        // --------------------------------

        res.status(200).json({ success: true, data: bid });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Counter a bid (Negotiation)
// @route   PUT /api/bids/:bidId/counter
// @access  Private (Owner)
exports.counterBid = async (req, res) => {
    try {
        const { amount } = req.body;
        const bid = await Bid.findById(req.params.bidId).populate('job');

        if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
        if (bid.job.postedBy.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        bid.status = 'countered';
        bid.counterOfferAmount = amount;
        await bid.save();

        res.status(200).json({ success: true, data: bid, message: 'Counter offer sent' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Respond to Counter (Worker)
// @route   PUT /api/bids/:bidId/respond
// @access  Private (Worker)
exports.respondToCounter = async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const bid = await Bid.findById(req.params.bidId);

        if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });
        if (bid.worker.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        if (action === 'accept') {
            bid.amount = bid.counterOfferAmount; // Update final amount
            bid.status = 'pending'; // Reset to pending so Owner can finally "Accept" it to trigger contract
            // alternatively, we could auto-accept here, but usually Owner has final say to "Hire".
            // Let's make it auto-update amount and keep status as 'counter_accepted' or just let Owner accept modified bid.
            // Simplified flow: Worker accepts counter -> Bid Amount Updates -> Owner accepts updated bid.
        } else {
            bid.status = 'rejected';
        }

        await bid.save();
        res.status(200).json({ success: true, data: bid });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
