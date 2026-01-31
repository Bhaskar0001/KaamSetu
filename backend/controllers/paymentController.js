const { Wallet, Transaction } = require('../models/Wallet');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper: Ensure wallet exists
const getOrCreateWallet = async (userId) => {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = await Wallet.create({ user: userId });
    }
    return wallet;
};

// @desc    Get Balance + History
// @route   GET /api/payments/wallet
exports.getWallet = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.id);
        const transactions = await Transaction.find({ wallet: wallet._id }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, data: { wallet, transactions } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add Funds (Deposit)
// @route   POST /api/payments/add-funds
exports.addFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

        const wallet = await getOrCreateWallet(req.user.id);
        wallet.balance += Number(amount);
        await wallet.save();

        await Transaction.create({
            wallet: wallet._id,
            type: 'DEPOSIT',
            amount: Number(amount),
            description: 'Loaded funds via Gateway',
            balanceAfter: wallet.balance,
        });

        res.status(200).json({ success: true, data: wallet });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Pay Worker (Transfer)
// @route   POST /api/payments/pay-worker
exports.payWorker = async (req, res) => {
    try {
        const { workerId, amount, pin, jobId } = req.body;

        if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

        // 1. Verify Verification PIN
        const sender = await User.findById(req.user.id).select('+pin');
        const isMatch = await bcrypt.compare(pin, sender.pin);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid PIN' });

        // 2. Fetch Wallets
        const senderWallet = await getOrCreateWallet(req.user.id);
        const receiverWallet = await getOrCreateWallet(workerId);

        // 3. Balance Check
        if (senderWallet.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient Balance' });
        }

        // 4. Atomic Transfer (Without Transactions for now as locally no ReplicaSet)
        // We use $inc to be atomic at document level
        // Decrement Sender
        const updatedSender = await Wallet.findOneAndUpdate(
            { _id: senderWallet._id, balance: { $gte: amount } }, // Optimistic Lock
            { $inc: { balance: -amount } },
            { new: true }
        );

        if (!updatedSender) return res.status(400).json({ success: false, message: 'Transfer Failed (Balance Changed)' });

        // Increment Receiver
        const updatedReceiver = await Wallet.findByIdAndUpdate(
            receiverWallet._id,
            { $inc: { balance: amount } },
            { new: true }
        );

        // 5. Log Transactions
        await Transaction.create({
            wallet: senderWallet._id,
            type: 'TRANSFER_OUT',
            amount: Number(amount),
            relatedUser: workerId,
            job: jobId,
            description: `Payment to Worker`,
            balanceAfter: updatedSender.balance,
        });

        await Transaction.create({
            wallet: receiverWallet._id,
            type: 'TRANSFER_IN',
            amount: Number(amount),
            relatedUser: req.user.id,
            job: jobId,
            description: `Payment from Owner`,
            balanceAfter: updatedReceiver.balance,
        });

        res.status(200).json({ success: true, data: updatedSender });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Withdraw Funds
// @route   POST /api/payments/withdraw
exports.withdrawFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

        const wallet = await getOrCreateWallet(req.user.id);

        if (wallet.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient Balance' });
        }

        // Debit
        const updatedWallet = await Wallet.findByIdAndUpdate(
            wallet._id,
            { $inc: { balance: -amount } },
            { new: true }
        );

        await Transaction.create({
            wallet: wallet._id,
            type: 'WITHDRAWAL',
            amount: Number(amount),
            description: 'Withdrawal to Bank Account',
            balanceAfter: updatedWallet.balance,
        });

        res.status(200).json({ success: true, data: updatedWallet });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
