const express = require('express');
const router = express.Router();
const Status = require("../db/models/Status");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");

/* GET all statuses. */
router.get('/', async (req, res) => {
    try {
        let statuses = await Status.find({});
        res.json(Response.successResponse(statuses));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* GET single status by ID. */
router.get('/:id', async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);
        if (!status) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Status not found");
        }
        res.json(Response.successResponse(status));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* ADD new status. */
router.post("/add", async (req, res) => {
    try {
        const { status_name } = req.body;
        if (!status_name) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Status name is required");
        }

        // Check if the status name already exists
        const existingStatus = await Status.findOne({ status_name });
        if (existingStatus) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Status name already exists");
        }

        // If the status name doesn't exist, proceed with adding the new status
        const status = new Status({
            status_name,
            is_active: true,
            created_by: req.user?.id
        });
        await status.save();
        res.json(Response.successResponse(status));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* UPDATE status by ID. */
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if the status exists
        const status = await Status.findById(id);
        if (!status) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Status not found");
        }

        // Perform the update
        const updatedStatus = await Status.findByIdAndUpdate(id, updates, { new: true });

        // Respond with the updated status
        res.json(Response.successResponse(updatedStatus));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* DELETE status by ID. */
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the status exists
        const status = await Status.findById(id);
        if (!status) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Status not found");
        }

        // Perform the deletion
        await Status.findByIdAndDelete(id);

        // Respond with a success message
        res.json(Response.successResponse({ success: true, message: "Status deleted successfully" }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
