const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }] // References to tasks associated with the column
}, {
    timestamps: true
});

const Column = mongoose.model("Column", columnSchema);

module.exports = Column;