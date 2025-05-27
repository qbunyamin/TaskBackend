const mongoose = require("mongoose");

const File = require("../../db/models/File"); 

const Remarks = require("../../db/models/Remarks"); 
const commentSchema = mongoose.Schema({
    remarkId: { type: mongoose.Schema.Types.ObjectId, ref: Remarks, required: true }, // Yoruma bağlı olan Remark'ın ID'si
    text: { type: String, required: true },
    currentstatus: { type: String, required: false },
    user: { type: String, required: false }, // Yorum metni
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: File }] // Yoruma ilişkilendirilmiş dosyaların ID'leri
}, {
    timestamps: true
});



class Comment extends mongoose.Model {}

commentSchema.loadClass(Comment);
module.exports = mongoose.model("comments", commentSchema);

