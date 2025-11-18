const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/packing-list';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const packingListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    items: [{
        itemName: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: ['Clothing', 'Toiletries', 'Documents', 'Electronics', 'Accessories', 'Other'],
            default: 'Other'
        },
        isPacked: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const PackingList = mongoose.model('PackingList', packingListSchema);

app.get('/api/lists', async (req, res) => {
    try {
        const lists = await PackingList.find().sort({ createdAt: -1 });
        res.json({
            message: 'success',
            data: lists
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.post('/api/lists', async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                message: 'fail',
                error: 'Title is required'
            });
        }

        const list = new PackingList({ 
            title,
            items: []
        });
        await list.save();

        res.status(201).json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.get('/api/lists/:id', async (req, res) => {
    try {
        const list = await PackingList.findById(req.params.id);

        if (!list) {
            return res.status(404).json({
                message: 'fail',
                error: 'List not found'
            });
        }

        res.json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.patch('/api/lists/:id', async (req, res) => {
    try {
        const { title } = req.body;

        const list = await PackingList.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true, runValidators: true }
        );

        if (!list) {
            return res.status(404).json({
                message: 'fail',
                error: 'List not found'
            });
        }

        res.json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.delete('/api/lists/:id', async (req, res) => {
    try {
        const list = await PackingList.findByIdAndDelete(req.params.id);

        if (!list) {
            return res.status(404).json({
                message: 'fail',
                error: 'List not found'
            });
        }

        res.json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.post('/api/lists/:id/items', async (req, res) => {
    try {
        const { itemName, category, isPacked } = req.body;

        if (!itemName || !category) {
            return res.status(400).json({
                message: 'fail',
                error: 'Item name and category are required'
            });
        }

        const list = await PackingList.findById(req.params.id);
        if (!list) {
            return res.status(404).json({
                message: 'fail',
                error: 'List not found'
            });
        }

        list.items.push({
            itemName,
            category,
            isPacked: isPacked || false
        });

        await list.save();

        res.status(201).json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.patch('/api/lists/:listId/items/:itemId', async (req, res) => {
    try {
        const { itemName, category, isPacked } = req.body;

        const list = await PackingList.findById(req.params.listId);
        if (!list) {
            return res.status(404).json({
                message: 'fail',
                error: 'List not found'
            });
        }

        const item = list.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({
                message: 'fail',
                error: 'Item not found'
            });
        }

        if (itemName !== undefined) item.itemName = itemName;
        if (category !== undefined) item.category = category;
        if (isPacked !== undefined) item.isPacked = isPacked;

        await list.save();

        res.json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.delete('/api/lists/:listId/items/:itemId', async (req, res) => {
    try {
        const list = await PackingList.findById(req.params.listId);
        if (!list) {
            return res.status(404).json({
                message: 'fail',
                error: 'List not found'
            });
        }

        list.items.pull(req.params.itemId);
        await list.save();

        res.json({
            message: 'success',
            data: list
        });
    } catch (error) {
        res.status(500).json({
            message: 'fail',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
