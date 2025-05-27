const mongoose = require("mongoose");

const schema = mongoose.Schema({
    type_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
    remark_id: { type: mongoose.SchemaTypes.ObjectId, required: true }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class UserRoles extends mongoose.Model {

}

schema.loadClass(UserRoles);
module.exports = mongoose.model("remark_types", schema);