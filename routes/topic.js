const express = require('express');
const router = express.Router();
const Topic = require("../db/models/Topic");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");

/* GET all topics. */
router.get('/', async (req, res) => {
    try {
        let topics = await Topic.find({});
        res.json(Response.successResponse(topics));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* GET single topic by ID. */
router.get('/:id', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Topic not found");
        }
        res.json(Response.successResponse(topic));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// /* ADD new topic. with language */router.post("/add", async (req, res) => {
//     try {
//         const { topic_name_en, topic_name_tr } = req.body;
//         if (!topic_name_en || !topic_name_tr) {
//             throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "English and Turkish topic names are required");
//         }

//         // Check if the topic names already exist
//         const existingTopic = await Topic.findOne({ "topic_name.en": topic_name_en });
//         if (existingTopic) {
//             throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Topic name already exists");
//         }

//         // If the topic names don't exist, proceed with adding the new topic
//         const topic = new Topic({
//             topic_name: {
//                 en: topic_name_en,
//                 tr: topic_name_tr
//             },
//             is_active: true,
//           //  created_by: req.user?.id
//         });
//         await topic.save();
//         res.json(Response.successResponse(topic));
//     } catch (err) {
//         let errorResponse = Response.errorResponse(err);
//         res.status(errorResponse.code).json(errorResponse);
//     }
// });
router.post("/add", async (req, res) => {
    try {
        const {  topic_name } = req.body;
        if (!topic_name) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", " topic name is required");
        }

        // Check if the topic names already exist
        const existingTopic = await Topic.findOne({ "topic_name": topic_name });
        if (existingTopic) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Topic name already exists");
        }

        // If the topic names don't exist, proceed with adding the new topic
        const topic = new Topic({
            topic_name: topic_name,
            is_active: true,
          //  created_by: req.user?.id
        });
        await topic.save();
        res.json(Response.successResponse(topic));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* UPDATE topic by ID. */
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if the topic exists
        const topic = await Topic.findById(id);
        if (!topic) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Topic not found");
        }

        // Perform the update
        const updatedTopic = await Topic.findByIdAndUpdate(id, updates, { new: true });

        // Respond with the updated topic
        res.json(Response.successResponse(updatedTopic));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* DELETE topic by ID. */
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the topic exists
        const topic = await Topic.findById(id);
        if (!topic) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Topic not found");
        }

        // Perform the deletion
        await Topic.findByIdAndDelete(id);

        // Respond with a success message
        res.json(Response.successResponse({ success: true, message: "Topic deleted successfully" }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
