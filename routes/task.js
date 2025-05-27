const express = require('express');
const router = express.Router();
const Task = require("../db/models/Task");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const Column = require("../db/models/Column");

/* GET all tasks */
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(Response.successResponse(tasks));
    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// POST add a new task
router.post('/add', async (req, res) => {
    const body = req.body;
    try {
        if (!body.name || !body.status || !body.columnId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name, status, and columnId fields must be filled");
        }

        const task = new Task({
            name: body.name,
            status: body.status,
            columnId: body.columnId,
            priority: body.priority || "medium",
            attachments: body.attachments || [],
            labels: body.labels || [],
            comments: body.comments || [],
            assignee: body.assignee || [],
            due: body.due || [],
            reporter: body.reporter || {}
        });

        // Yeni oluşturulan görevi veritabanına kaydet
        await task.save();
        
const column = await Column.findById(body.columnId);
task.columnId = column._id;
        // Oluşturulan görevin tüm verilerini yanıt olarak döndür
        res.json(Response.successResponse({ success: true, task: task }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// POST update an existing task
router.post('/update', async (req, res) => {
    const body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
        }

        const updates = {};
        for (const key in body) {
            if (key !== '_id') { // Exclude _id from updates
                updates[key] = body[key];
            }
        }

        await Task.updateOne({ _id: body._id }, updates);

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// POST move a task
router.post('/move', async (req, res) => {
    const { taskId, sourceColumnId, destinationColumnId } = req.body;
    try {
        if (!taskId || !sourceColumnId || !destinationColumnId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "taskId, sourceColumnId, and destinationColumnId fields must be filled");
        }

        // Find the task by ID
        const task = await Task.findById(taskId);
        if (!task) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Task not found!", `Task with ID ${taskId} does not exist.`);
        }

        // Update the columnId of the task
        task.columnId = destinationColumnId;

        // Save the updated task
        await task.save();

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


// POST delete a task
router.post('/delete', async (req, res) => {
    const body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
        }

        await Task.deleteOne({ _id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


module.exports = router;
