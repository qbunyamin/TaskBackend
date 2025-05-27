const express = require('express');
const router = express.Router();
const multer = require('multer'); // Dosya yüklemek için multer kütüphanesi

const fs = require('fs');
const path = require('path');
const File = require("../db/models/File");

// Multer ayarları
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Dosyaların nereye kaydedileceği
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.dwg', '.catpart', '.catproduct', '.sldprt', '.sldasm', '.igs', '.step'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Desteklenmeyen dosya türü.'));   
        }
    }
});

// router.post("/upload", upload.single('files'), async (req, res) => {
//     res.send("success");
// });
// Dosya yükleme endpoint'i
router.post("/upload/:remarkId", upload.array('files'), async (req, res) => {
    try {
      const remarkId = req.params.remarkId; // Remark ID'sini al
      const uploadedFiles = req.files; // Yüklenen dosyaları al
  
      // Yüklenen her dosya için bir dizi oluştur
      const fileIds = [];
      const fileURLs = [];
      for (const file of uploadedFiles) {
        const { filename, mimetype: contentType, size } = file;
        const fileURL = req.protocol + '://' + req.get('host') + '/uploads/' + filename; // Dosya URL'sini oluştur
        fileURLs.push(fileURL); // URL'leri diziye ekle
        // Dosya bilgilerini veritabanına kaydet
        const newFile = new File({ filename, contentType, size, remarkId, url: fileURL });
        await newFile.save();
        // Dosyanın _id'sini al ve dosya ID'lerini bir diziye ekleyin
        fileIds.push(newFile._id);
      }
  
      // Yüklenen dosyaların ID'lerini ve URL'lerini response ile gönder
      res.json({ success: true, message: "Dosyalar başarıyla yüklendi.", fileIds: fileIds, fileURLs: fileURLs });
    } catch (err) {
      console.error("Dosya yükleme hatası:", err);
      res.status(500).json({ success: false, message: "Dosyalar yüklenirken bir hata oluştu." });
    }
});

router.get("/downloadFile/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;

        // Dosya yolunu oluştur
        const filePath = path.join(__dirname, '../uploads/', filename);

        // Dosyanın var olup olmadığını kontrol et
        if (fs.existsSync(filePath)) {
            // Dosyayı indir
            res.download(filePath, filename);
        } else {
            res.status(404).json({ success: false, message: "Dosya bulunamadı." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Dosya indirilirken bir hata oluştu." });
    }
});
router.post("/uploadfile/:remarkId", upload.array('files'), async (req, res) => {
    console.log("req",req)
    let body = req.body;
    try {
        const remarkId = req.params.remarkId; // Remark ID'sini al
        const uploadedFiles = body.files; // Yüklenen dosyaları al
        
        // Dosyaların URL'lerini oluştur
        const fileURLs = uploadedFiles.map(file => {
            return {
                filename: file.filename,
                url: req.protocol + '://' + req.get('host') + '/uploads/' + file.filename
            };
        });
        
        // Her bir dosya için veritabanına kayıt işlemi
        for (const file of uploadedFiles) {
            const { filename, contentType, size } = file;
            const newFile = new File({ filename, contentType, size, remarkId });
            await newFile.save();
        }

        res.json({ success: true, message: "Dosyalar başarıyla yüklendi.", fileURLs: fileURLs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Dosyalar yüklenirken bir hata oluştu." });
    }
});

router.get("/download/:fileId", async (req, res) => {
    try {
        const fileId = req.params.fileId;

        // Veritabanından dosya bilgilerini al
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: "Dosya bulunamadı." });
        }

        // Dosya türüne göre önizleme URL'si oluştur
        let downloadUrl = `http://localhost:3000/api/file/downloadFile/${file.filename}`;
        if (file.contentType === 'image/png') {
            downloadUrl = `http://localhost:3000/api/file/preview/${fileId}`;
        }

        // İndirme bağlantısını response ile gönder
        res.json({ success: true, downloadUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Dosya indirilirken bir hata oluştu." });
    }
});

  
router.post("/delete/:fileId", async (req, res) => {
    try {
        const fileId = req.params.fileId; // Dosya ID'sini al
        // Veritabanından dosyayı sil
        await File.findByIdAndDelete(fileId);

        res.json({ success: true, message: "Dosya başarıyla silindi." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Dosya silinirken bir hata oluştu." });
    }
});
// Tüm dosyaları listeleme endpoint'i
router.get("/files", async (req, res) => {
    try {
        const files = await File.find();
        res.json({ success: true, files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Dosyaları listelerken bir hata oluştu." });
    }
});
router.get("/files/:remarkId", async (req, res) => {
    try {
        const remarkId = req.params.remarkId; // Remark ID'sini al
        // Veritabanından belirli bir Remark ID'ye ait tüm dosyaları bul
        const files = await File.find({ remarkId: remarkId });
        res.json({ success: true, files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Dosyaları getirirken bir hata oluştu." });
    }
});

module.exports = router;
