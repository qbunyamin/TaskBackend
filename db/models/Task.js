const mongoose = require("mongoose");

const Column = require("./Column");

const taskSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // Görevin adı
    status: { type: String, required: true }, // Görevin durumu
    columnId: { type: mongoose.Schema.Types.ObjectId, ref: "Column" }, // Reference to the Column model
   
    priority: { type: String, default: "medium" }, // Görevin önceliği (varsayılan olarak orta)
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }], // Göreve ilişkilendirilmiş dosyaların ID'leri
    labels: [{ type: String }], // Görevin etiketleri
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Göreve ilişkilendirilmiş yorumların ID'leri
    assignee: [{ type: String }], // Görevi atanmış kişilerin adları
    due: [{ type: Date }], // Görevin bitiş tarihi
    description:{ type: String, required: false },
    reporter: { // Görevi raporlayan kişi
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatarUrl: { type: String }
    }
  },
  {
    timestamps: true // Oluşturma ve güncelleme tarihlerini otomatik olarak tutar
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
