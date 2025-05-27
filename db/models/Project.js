
const mongoose = require("mongoose");

const schema = mongoose.Schema({
    project_name: {type: String, required: true},

    project_owner: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    created_by: {
        type: mongoose.SchemaTypes.ObjectId
    }
},{
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Roles extends mongoose.Model {

}

schema.loadClass(Roles);
module.exports = mongoose.model("projects", schema);