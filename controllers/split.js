const Split = require('../models/split');
const User = require('../models/user');

const addSplit = async (req, res) => {
    try {
        const { creatorId, totalAmount, participants, title } = req.body;

        const updatedParticipants = await Promise.all(participants.map(async (participant) => {
            const { name, phone, splitAmount, paid = false } = participant;
            let user = await User.findOne({ phone });
            if (!user) {
                user = new User({
                    email: `${phone}@example.com`,
                    username: name || `user_${phone}`,
                    password: `${phone}`,
                });
                await user.save();
            }
            return {
                user: user._id,
                splitAmount,
                paid
            };
        }));

        const newSplit = new Split({
            creatorId,
            totalAmount,
            participants: updatedParticipants,
            title,
        });

        const savedSplit = await newSplit.save();

        res.status(201).json({
            message: 'Split added successfully',
            split: savedSplit
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding split',
            error: error.message
        });
    }
};

const getSplits = async (req, res) => {
    try {
        const { userId } = req.params;
        const splits = userId
            ? await Split.find({ 'participants.user': userId }).populate('participants.user')
            : await Split.find().populate('participants.user');

        res.status(200).json({
            message: 'Splits fetched successfully',
            splits, 
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching splits',
            error: error.message
        });
    }
};

const deleteSplit = async (req, res) => {
    try {
        const { splitId } = req.params;
        const deletedSplit = await Split.findByIdAndRemove(splitId);
        if (!deletedSplit) {
            return res.status(404).json({
                message: 'Split not found'
            });
        }
        res.status(200).json({
            message: 'Split deleted successfully',
            split: deletedSplit
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting split',
            error: error.message
        });
    }
};

const summarizeSplitForUser = async (req, res) => {
    const userId = req.body.userId;

    try {
        const splits = await Split.find({
            'participants.user': userId
        })
        .populate('participants.user', 'username email') // Populate user details
        .populate('creatorId', 'username email') // Populate creator details
        .populate('expense'); // Populate linked expense details
        let totalToGive = 0;
        let totalToTake = 0;
        const owes = []; // Users the current user owes money to
        const owedBy = []; // Users who owe money to the current user

        splits.forEach(split => {
            const participant = split.participants.find(p => p.user._id == userId);
            console.log(participant);
            if (participant) {
                const splitAmount = split.totalAmount / split.participants.length;
                console.log(`Split Amount per participant: ${splitAmount}`); // Debugging
                if (participant.paid) {
                    console.log(`Participant ${participant.user.username} has paid.`); 
                    split.participants.forEach(p => {
                        if (p.user.toString() !== userId && !p.paid) {
                            console.log(`Adding to owedBy: ${p.user.username} owes ${splitAmount}`); 
                            owedBy.push({
                                user: p.user,
                                amount: splitAmount // 
                            });
                            totalToTake += splitAmount; // 
                        }
                    });
                } else {
                    console.log(`Participant ${participant.user.username} has not paid.`); // Debugging
                    split.participants.forEach(p => {
                        if (p.user.toString() !== userId) {
                            console.log(`Adding to owes: ${p.user.username} owes ${splitAmount}`); // Debugging
                            owes.push({
                                user: p.user,
                                amount: splitAmount // The other user owes the current user
                            });
                            totalToGive += splitAmount; // Total amount the user owes
                        }
                    });
                }
            }
        });

        res.status(200).json({
            totalToGive,
            totalToTake,
            owes,
            owedBy,
            splits
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while summarizing the splits.' });
    }
};

module.exports = { addSplit, getSplits, deleteSplit, summarizeSplitForUser };
