// models/Project.js
const mongoose = require('mongoose');

const TankPipePenSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  columns: { type: Map, of: String }, // Dinamik kolonlar
});

module.exports = mongoose.model('TankPipePen', TankPipePenSchema);
