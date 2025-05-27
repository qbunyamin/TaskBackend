var express = require('express');
var router = express.Router();
const Remarks = require("../db/models/Remarks"); // Changed import statement
const Response = require("../lib/Response");

const Projects = require("../db/models/Project");
const Status = require("../db/models/Status");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
// TODO: const AuditLogs = require("../lib/AuditLogs.js");
 const logger = require("../lib/logger/LoggerClass");
 const moment = require('moment'); 

/* GET remarks listing. */
/* GET remarks listing with filtering. */
router.get('/', async (req, res, next) => {
    try {
      
        // Extract query parameters
        const { statu, project, type, owner, lastdate } = req.query;

        // Construct filter object
        const filter = {};
        if (statu) {
            filter.statu = statu;
        }
        if (project) {
            filter.project = project;
        }
        if (type) {
            filter.type = type;
        }
        if (owner) {
            filter.owner = owner;
        }
        if (lastdate) {
            filter.lastdate = lastdate;
        }

        // Fetch remarks based on the filter
        let remarks = await Remarks.find(filter).sort({ created_at: 'desc' });

        res.json(Response.successResponse(remarks));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/allprojectdata', async (req, res) => {
    try {   const remarks = await Remarks.aggregate([
        {
            $group: {
                _id: {
                    project: '$project',
                    statu: '$statu'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.project',
                statuses: {
                    $push: {
                        statu: '$_id.statu',
                        count: '$count'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                project: '$_id',
                statuses: 1
            }
        }
    ]);

    // İstenilen formatta sonucu düzenle
    const result = {};
    remarks.forEach(item => {
        result[item.project] = {
            InProgress: [],
            Completed: [],
            Done: [],
            Closed: [],
            Suspended: [],
            Cancelled: [],
            Published: [],
            Authorized: [],
            Draft: []
            // Include all other status options dynamically
            // You can fetch these from your API response or use a predefined list
          
        };

        item.statuses.forEach(status => {
            if (result[item.project][status.statu]) {
                result[item.project][status.statu].push({ count: status.count });
            }
        });
    });

    // Response'u döndür
    res.json({
        code: 200,
        data: result
    });
} catch (err) {
    console.error("Error fetching remark statuses:", err);
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
}
});




router.get('/:id', async (req, res, next) => {
    try {
        const remarkId = req.params.id;

        // Fetch the remark detail by ID
        const remark = await Remarks.findById(remarkId);

        if (!remark) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Remark not found");
        }

        res.json(Response.successResponse(remark));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});



/* ADD remarks listing. */
router.post("/add", async (req, res) => {
    let body = req.body;
    try {

console.log("body",body)
        // Check if all required fields are provided
        if (!body.project || !body.statu || !body.type || !body.topic || !body.owner || !body.writer || !body.title || !body.desc || !body.lastdate) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "All fields must be filled");
        }
        // Create a new remark object
        let remark = new Remarks({
            project: body.project,
            statu: body.statu,
            type: body.type,
            topic: body.topic,
            owner: body.owner,
            writer: body.writer,
            title: body.title,
            desc: body.desc,
            lastdate: body.lastdate,
            Remark_Number: body.Remark_Number, // Automatically generated, no need to provide in body
            is_active: true,
           // created_by: req.user?.id
        });

        await remark.save();

        // TODO:  AuditLogs.info(req.user?.email, "Remarks", "Add", remark);
         logger.info(req.user?.email, "Remarks", "Add", remark);

        res.json(Response.successResponse({ success: true,remark }));

    } catch (err) {
        logger.error(req.user?.email, "Remarks", "Add", err);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/statistics/:timerange', async (req, res) => {
    try {
        const { timerange } = req.params;

        if (!['days','weeks', 'month', 'year', 'years'].includes(timerange)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Time range must be 'week', 'month','days', 'year', or 'years'");
        }

        let startDate;
        let endDate = moment().endOf('day');
        let groupBy;
        let dateLabels;

        if (timerange === 'days') {  //week day dir
            startDate = moment().startOf('week');
            groupBy = { $dayOfWeek: '$created_at' }; //created_at
            
            dateLabels = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        } else if (timerange === 'weeks') { // Specific case for 52 weeks
            startDate = moment().startOf('year');
            groupBy = { $isoWeek: '$created_at' };
            dateLabels = Array.from({ length: 52 }, (_, i) => (i + 1).toString());
          }   else if (timerange === 'year') {
            startDate = moment().startOf('year');
            groupBy = { $month: '$created_at' }; //created_at
            dateLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        } else if (timerange === 'years') {
            startDate = moment().subtract(5, 'years').startOf('day');
            groupBy = { $year: '$created_at' }; //created_at
            dateLabels = Array.from({ length: 5 }, (_, i) => (moment().year() - i).toString());
        }

        const remarks = await Remarks.aggregate([
            {
                $match: {
                    created_at: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                }
            },
            {
                $group: {
                    _id: { statu: '$statu', date: groupBy, project: '$project' },
                    count: { $sum: 1 },
                   
                }
            },
            {
                $project: {
                    _id: 0,
                    statu: '$_id.statu',
                    date: '$_id.date',
                    project: '$_id.project',
                    count: 1
                }
            }
        ]);
console.log("remarks1",remarks)
        const groupedData = {};

        remarks.forEach(r => {
         //   console.log("remarks",r)
            if (!groupedData[r.project]) {
                groupedData[r.project] = {};
                dateLabels.forEach(label => {
                    if (timerange === 'year' || timerange === 'years'|| timerange === 'days') {
                        groupedData[r.project][label.toLowerCase()] = [];
                    } else {
                        groupedData[r.project][label] = [];
                    }
                });
            }

            let key;
            if (timerange === 'days') {   key = dateLabels[r.date-1].toLowerCase(); }

            else if (timerange === 'weeks') { key = r.date.toString();  } 

            else if (timerange === 'years') {
                key = r.date.toString();
            } else if (timerange === 'year') {
                key = dateLabels[r.date - 1].toLowerCase();
            } else {
                key = r.date.toString();
            }

            if (!groupedData[r.project][key]) {
                groupedData[r.project][key] = [];
            }
            groupedData[r.project][key].push({
                count: r.count,
                statu: r.statu,
                date: r.date
            });
        });

        res.json(Response.successResponse(groupedData));
    } catch (err) {
        console.error("Error fetching remarks statistics:", err);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});



router.post("/addarray", async (req, res) => {
    let body = req.body;
    try {
        if (!Array.isArray(body)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Body must be an array of remarks");
        }

        for (let remarkData of body) {
            if (!remarkData.project || !remarkData.statu || !remarkData.type || !remarkData.topic || !remarkData.owner || !remarkData.writer || !remarkData.title || !remarkData.desc || !remarkData.lastdate) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "All fields must be filled for each remark");
            }

            // Validate and set created_at
            let createdAtDate = remarkData.created_at ? new Date(remarkData.created_at) : undefined;
            if (createdAtDate && isNaN(createdAtDate)) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Invalid date format for created_at");
            }

            let remark = new Remarks({
                project: remarkData.project,
                statu: remarkData.statu,
                type: remarkData.type,
                topic: remarkData.topic,
                owner: remarkData.owner,
                writer: remarkData.writer,
                title: remarkData.title,
                desc: remarkData.desc,
                lastdate: remarkData.lastdate,
                Remark_Number: remarkData.Remark_Number,
                is_active: true,
                created_at: createdAtDate // Set the created_at field if provided
            });

            await remark.save();
            logger.info(req.user?.email, "Remarks", "Add", remark);
        }

        res.json(Response.successResponse({ success: true, message: "Remarks added successfully" }));
    } catch (err) {
        logger.error(req.user?.email, "Remarks", "Add", err);
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


// /* ADD multiple remarks listing. */
// router.post("/addarray", async (req, res) => {
//     let body = req.body;
//     try {
//         if (!Array.isArray(body)) {
//             throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Body must be an array of remarks");
//         }

//         for (let remarkData of body) {
//             if (!remarkData.project || !remarkData.statu || !remarkData.type || !remarkData.topic || !remarkData.owner || !remarkData.writer || !remarkData.title || !remarkData.desc || !remarkData.lastdate) {
//                 throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "All fields must be filled for each remark");
//             }

//             let remark = new Remarks({
//                 project: remarkData.project,
//                 statu: remarkData.statu,
//                 type: remarkData.type,
//                 topic: remarkData.topic,
//                 owner: remarkData.owner,
//                 writer: remarkData.writer,
//                 title: remarkData.title,
//                 desc: remarkData.desc,
//                 lastdate: remarkData.lastdate,
//                 Remark_Number: remarkData.Remark_Number,
//                 is_active: true,
//             });

//             await remark.save();
//             logger.info(req.user?.email, "Remarks", "Add", remark);
//         }

//         res.json(Response.successResponse({ success: true, message: "Remarks added successfully" }));
//     } catch (err) {
//         logger.error(req.user?.email, "Remarks", "Add", err);
//         let errorResponse = Response.errorResponse(err);
//         res.status(errorResponse.code).json(errorResponse);
//     }
// });


// hem date hem statü'ye göre her bir gün kaç adet hangi statüden oluşturulmuş dönüyor
// router.get('/statistics/:timerange', async (req, res) => {
//     try {
//         const { timerange } = req.params;

//         if (!['week', 'month', 'year', 'years'].includes(timerange)) {
//             throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Time range must be 'week', 'month', 'year', or 'years'");
//         }

//         let startDate;
//         let endDate = moment().endOf('day').toDate();

//         if (timerange === 'week') {
//             startDate = moment().subtract(1, 'weeks').startOf('day').toDate();
//         } else if (timerange === 'month') {
//             startDate = moment().subtract(1, 'months').startOf('day').toDate();
//         } else if (timerange === 'year') {
//             startDate = moment().subtract(1, 'years').startOf('day').toDate();
//         } else if (timerange === 'years') {
//             startDate = moment().subtract(5, 'years').startOf('day').toDate();
//         }

//         let groupBy;
//         if (timerange === 'week') {
//             groupBy = {
//                 $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
//             };
//         } else if (timerange === 'month') {
//             groupBy = {
//                 $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
//             };
//         } else if (timerange === 'year') {
//             groupBy = {
//                 $dateToString: { format: "%Y-%m", date: "$created_at" }
//             };
//         } else if (timerange === 'years') {
//             groupBy = {
//                 $dateToString: { format: "%Y", date: "$created_at" }
//             };
//         }

//         const remarks = await Remarks.aggregate([
//             {
//                 $match: {
//                     created_at: { $gte: startDate, $lte: endDate }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { statu: '$statu', date: groupBy },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     statu: '$_id.statu',
//                     date: '$_id.date',
//                     count: 1
//                 }
//             },
//             {
//                 $sort: { date: 1 }
//             }
//         ]);

//         res.json(Response.successResponse(remarks));

//     } catch (err) {
//         logger.error("Error fetching remarks statistics:", err);
//         let errorResponse = Response.errorResponse(err);
//         res.status(errorResponse.code).json(errorResponse);
//     }
// });

// router.post("/addarray", async (req, res) => {
//     let body = req.body;
//     try {
//         // Check if body is an array
//         if (!Array.isArray(body)) {
//             throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Body must be an array of remarks");
//         }

//         // Iterate over each item in the body array
//         for (let remarkData of body) {
//             // Check if all required fields are provided for each remark
//             if (!remarkData.project || !remarkData.statu || !remarkData.type || !remarkData.topic || !remarkData.owner || !remarkData.writer || !remarkData.title || !remarkData.desc || !remarkData.lastdate) {
//                 throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "All fields must be filled for each remark");
//             }

//             // Create a new remark object
//             let remark = new Remarks({
//                 project: remarkData.project,
//                 statu: remarkData.statu,
//                 type: remarkData.type,
//                 topic: remarkData.topic,
//                 owner: remarkData.owner,
//                 writer: remarkData.writer,
//                 title: remarkData.title,
//                 desc: remarkData.desc,
//                 lastdate: remarkData.lastdate,
//                 Remark_Number: remarkData.Remark_Number, // Automatically generated, no need to provide in body
//                 is_active: true,
//                 // created_by: req.user?.id
//             });

//             await remark.save();

//             // TODO:  AuditLogs.info(req.user?.email, "Remarks", "Add", remark);
//             logger.info(req.user?.email, "Remarks", "Add", remark);
//         }

//         res.json(Response.successResponse({ success: true, message: "Remarks added successfully" }));

//     } catch (err) {
//         logger.error(req.user?.email, "Remarks", "Add", err);
//         let errorResponse = Response.errorResponse(err);
//         res.status(errorResponse.code).json(errorResponse);
//     }
// });

/* UPDATE remarks listing. */
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if any updates are provided
        
        if (Object.keys(updates).length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "No updates provided");
        }

        // Update the remark
        const remark = await Remarks.findByIdAndUpdate(id, updates, { new: true });

        // Check if the remark exists
        if (!remark) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Remark not found");
        }

        // TODO: AuditLogs.info(req.user?.email, "Remarks", "Update", { _id: id, ...updates });

        res.json(Response.successResponse(remark));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* DELETE remarks listing. */
router.post("/delete", async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        await Remarks.deleteOne({ _id: body._id });

        // TODO:   AuditLogs.info(req.user?.email, "Remarks", "Delete", { _id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
})
/* DELETE many remarks listing. */
router.post("/deleteMultiple", async (req, res) => {
    let body = req.body;
    try {
        if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "ids field must be a non-empty array");
        }

        await Remarks.deleteMany({ _id: { $in: body.ids } });

        // TODO: AuditLogs.info(req.user?.email, "Remarks", "DeleteMultiple", { ids: body.ids });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
})
module.exports = router;
