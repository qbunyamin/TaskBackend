const mongoose = require("mongoose");

const Remarks = require("../../db/models/Remarks"); 

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true }, // Dosya adı
    contentType: { type: String, required: true }, // Dosya türü (ör. image/png)
    size: { type: Number, required: true }, // Dosya boyutu
    uploadDate: { type: Date, default: Date.now }, // Yükleme tarihi
    remarkId: { type: mongoose.Schema.Types.ObjectId, ref: Remarks }, // Remark ID ile ilişki
    url: { type: String }
    // Diğer metadata alanları eklenebilir
});


class File extends mongoose.Model {

}

fileSchema.loadClass(File);
module.exports = mongoose.model("file", fileSchema);