const express = require('express');
const router = express.Router();
const Column = require('../db/models/Column');
const Task = require('../db/models/Task');
const Order = require('../db/models/Order');

router.get('/data', async (req, res) => {
    try {
        const columns = await Column.find({}).lean().exec();
        const tasks = await Task.find({}).lean().exec();
        const order = await Order.findOne({}).populate('columnIds').lean().exec();

        // Create a map to store taskIds for each column
        const columnTaskIdsMap = {};

        // Iterate over tasks to populate the map
        for (const task of tasks) {
            if (!columnTaskIdsMap[task.columnId]) {
                columnTaskIdsMap[task.columnId] = [task._id];
            } else {
                columnTaskIdsMap[task.columnId].push(task._id);
            }
        }

        // Iterate over columns and add taskIds from the map
        const columnsWithTaskIds = columns.map(column => ({
            ...column,
            taskIds: columnTaskIdsMap[column._id] || [] // Get taskIds from the map or default to an empty array
        }));

        // Check if order exists
        if (order) {
            // Fill in taskIds for columns in the order
            order.columnIds.forEach(orderColumn => {
                const matchingColumn = columnsWithTaskIds.find(column => column._id.toString() === orderColumn._id.toString());
                if (matchingColumn) {
                    orderColumn.taskIds = matchingColumn.taskIds;
                }
            });
        }

        res.json({
            columns: columnsWithTaskIds,
            tasks,
            order
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
