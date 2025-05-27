const mongoose = require("mongoose");

const schema = mongoose.Schema({
    project: { type: String, required: true }, //proje
    statu: { type: String, required: true },//durum
    type: { type: String, required: true },//Remark tipi
    topic: { type: String, required: true },//REmark konusu
    owner: { type: String, required: true }, //Remark yöneticisi
    writer: { type: String, required: true },//yazar
    title: { type: String, required: true },//Remark Başlığı
    desc: { type: String, required: false },//Remark Açıklama
    lastdate: { type: String, required: true },//Hedef tarihi
    Remark_Number: { type: String }  //remark numara,
    
}, {
    timestamps: {
        createdAt: "created_at",  //eklenme tarihi
        updatedAt: "updated_at"
    }
});

// Define a pre-save hook to generate Remark_Number
schema.pre('save', async function(next) {
    try {
        // Check if Remark_Number already exists
        if (!this.Remark_Number) {
            // Fetch the latest remark with the same project and type
            const latestRemark = await this.constructor.findOne({ project: this.project, type: this.type })
                .sort({ created_at: -1 })
                .select('Remark_Number');

            // Generate Remark_Number based on the latest remark
            if (latestRemark) {
                const latestRemarkNumber = parseInt(latestRemark.Remark_Number.split('-')[2]);
                this.Remark_Number = `${this.project}-${this.type}-${(latestRemarkNumber + 1).toString().padStart(3, '0')}`;
            } else {
                // If no previous remark found, start with 001
                this.Remark_Number = `${this.project}-${this.type}-001`;
            }
        }
        next();
    } catch (err) {
        next(err);
    }
});

class Remarks extends mongoose.Model {}

schema.loadClass(Remarks);
module.exports = mongoose.model("remarks", schema);
