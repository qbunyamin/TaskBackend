const express = require('express');
const router = express.Router();
const Project = require("../db/models/Project");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");

/* GET all projects. */
router.get('/', async (req, res) => {
    try {
        let projects = await Project.find({});
        res.json(Response.successResponse(projects));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
/* GET single project by ID. */
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Project not found");
        }
        res.json(Response.successResponse(project));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});
router.post("/add", async (req, res) => {
    try {
        const { project_name, project_owner } = req.body;
        if (!project_name || !project_owner) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Project name and owner are required");
        }

        // Check if the project name already exists
        const existingProject = await Project.findOne({ project_name });
        if (existingProject) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Project name already exists");
        }

        // If the project name doesn't exist, proceed with adding the new project
        const project = new Project({
            project_name,
            project_owner,
            is_active: true,
            created_by: req.user?.id
        });
        await project.save();
        res.json(Response.successResponse(project));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* UPDATE project by ID. */
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if the project exists
        const project = await Project.findById(id);
        if (!project) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Project not found");
        }

        // Perform the update
        const updatedProject = await Project.findByIdAndUpdate(id, updates, { new: true });

        // Respond with the updated project
        res.json(Response.successResponse(updatedProject));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* DELETE project by ID. */
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the project exists
        const project = await Project.findById(id);
        if (!project) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Project not found");
        }

        // Perform the deletion
        await Project.findByIdAndDelete(id);

        // Respond with a success message
        res.json(Response.successResponse({ success: true, message: "Project deleted successfully" }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
