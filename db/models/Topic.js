const mongoose = require("mongoose");

const schema = mongoose.Schema({
   // çift dil
    // topic_name: {
    //     en: { type: String, required: true },
    //     tr: { type: String, required: true }
    // },
    topic_name: {type: String, required: true, unique: true},
    is_active: { type: Boolean, default: true },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        required: false
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Roles extends mongoose.Model {}

schema.loadClass(Roles);
module.exports = mongoose.model("topic", schema);
