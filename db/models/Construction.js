const mongoose = require("mongoose");

const constructionSchema = new mongoose.Schema({
    Type: { type: String,index: true  },
    L1: { type: String },
    L2: { type: String },
    L3: { type: String },
    L4: { type: String },
    L5: { type: String },
    L6: { type: String },
    L7: { type: String },
    L8: { type: String },
    L9: { type: String },
    L10: { type: String },
    L11: { type: String },
    L12: { type: String },
    L13: { type: String },
    L14: { type: String },
    L15: { type: String },
    L16: { type: String },
    L17: { type: String },
    L18: { type: String },
    L19: { type: String },
    L20: { type: String },
    L21: { type: Number },
    L22: { type: Number },
    L23: { type: Number },
    L24: { type: Number },
    L25: { type: Number },
    L26: { type: Number },
    L27: { type: Number },
    L28: { type: Number },
    L29: { type: Number },
    L30: { type: Number },
    L31: { type: Number },
    L32: { type: Number },
    L33: { type: Number },
    L34: { type: Number },
    L35: { type: Number },
    L36: { type: Number },
    L37: { type: Number },
    L38: { type: Number },
    L39: { type: Number },
    L40: { type: Number },
    L41: { type: Number },
    L42: { type: Number },
    L43: { type: Number },
    L44: { type: Number },
    L45: { type: Number },
    L46: { type: Number },
    L47: { type: Number },
    L48: { type: Number },
    L49: { type: Number },
    L50: { type: Date }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Construction extends mongoose.Model {}

constructionSchema.loadClass(Construction);
module.exports = mongoose.model("construction", constructionSchema);
