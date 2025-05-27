const express = require('express');
const router = express.Router();
const Column = require('../db/models/Column'); // Import your Column model here
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const Task = require('../db/models/Task');




router.get('/withtask', async (req, res) => {
    try {
      const columns = await Column.find();
      const columnsWithTasks = [];
  
      for (const column of columns) {
        const tasks = await Task.find({ columnId: column._id });
        columnsWithTasks.push({
          ...column.toObject(),
          taskIds: tasks.map(task => task._id)
        });
      }
  
      res.status(200).json(columnsWithTasks);
    } catch (error) {
      console.error('Error fetching columns with tasks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Route for creating a new column
router.post('/add', async (req, res) => {
  try {
    const { name } = req.body; // Assuming the request body contains the name of the column

    // Validation: Check if the name field is provided
    if (!name) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 'Validation Error!', 'Name field must be filled');
    }

    // Create a new column instance
    const newColumn = new Column({
      name: name,
      // Add any other fields you want to include in the new column object
    });

    // Save the new column to the database
    await newColumn.save();

    // Respond with success message
    res.json(Response.successResponse({ success: true }));
  } catch (error) {
    // Handle errors
    const errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.post('/update', async (req, res) => {
    const { columnId, columnName } = req.body;
    try {
        if (!columnId || !columnName) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Both columnId and columnName must be provided");
        }

        await Column.findByIdAndUpdate(columnId, { name: columnName });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// Assuming `newOrdered` is an array of columnIds in the desired order
router.post('/move', async (req, res) => {
    const { newOrdered } = req.body;
    try {
        if (!newOrdered || !Array.isArray(newOrdered)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "newOrdered must be a non-empty array of columnIds");
        }

        // Update the ordering of columns in the database based on `newOrdered`

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.post('/clear', async (req, res) => {
    const { columnId } = req.body;
    try {
        if (!columnId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "columnId must be provided");
        }

        router.post('/clear', async (req, res) => {
            const { columnId } = req.body;
            try {
                if (!columnId) {
                    throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "columnId must be provided");
                }
        
                // Find tasks associated with the specified columnId and clear them
                await Task.updateMany({ columnId }, { $unset: { columnId: "" } });
        
                res.json(Response.successResponse({ success: true }));
        
            } catch (err) {
                const errorResponse = Response.errorResponse(err);
                res.status(errorResponse.code).json(errorResponse);
            }
        });
        

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.post('/delete', async (req, res) => {
    const { columnId } = req.body;
    try {
        if (!columnId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "columnId must be provided");
        }

        // Delete the column and associated tasks from the database

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});




module.exports = router;
