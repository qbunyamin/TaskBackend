const express = require('express');
const router = express.Router();
const Type = require("../db/models/Type");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");

/* GET all types. */
router.get('/', async (req, res) => {
    try {
        let types = await Type.find({});
        res.json(Response.successResponse(types));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* GET single type by ID. */
router.get('/:id', async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);
        if (!type) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Type not found");
        }
        res.json(Response.successResponse(type));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* ADD new type. */
router.post("/add", async (req, res) => {
    try {
        const { type_name } = req.body;

        // Check if the type name already exists
        const existingType = await Type.findOne({ type_name });
        if (existingType) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Type name already exists");
        }

        // If type name doesn't exist, proceed with adding the new type
        const type = new Type({
            type_name,
            is_active: true,
            created_by: req.user?.id
        });
        await type.save();
        res.json(Response.successResponse(type));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* UPDATE type by ID. */
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if the type exists
        const type = await Type.findById(id);
        if (!type) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Type not found");
        }

        // Perform the update
        const updatedType = await Type.findByIdAndUpdate(id, updates, { new: true });

        // Respond with the updated type
        res.json(Response.successResponse(updatedType));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* DELETE type by ID. */
/* DELETE type by ID. */
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the type exists
        const type = await Type.findById(id);
        if (!type) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Type not found");
        }

        // Perform the deletion
        await Type.findByIdAndDelete(id);

        // Respond with a success message
        res.json(Response.successResponse({ success: true, message: "Type deleted successfully" }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


module.exports = router;
