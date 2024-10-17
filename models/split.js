const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true
    },
    participants: [{ 
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        splitAmount: {
            type: Number,  
            required: true
        },
        paid: {
            type: Boolean, 
            default: false
        }
    }],
    expense: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    },
    settled: {
        type: Boolean, 
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Split', splitSchema);
