const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    columnIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Column" }] // Array of column IDs in the desired order
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
