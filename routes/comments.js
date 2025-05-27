const express = require('express');
const router = express.Router();
const Comment = require("../db/models/Comments");
const File = require("../db/models/File"); // "File" modelini içeri aktarıyoruz

// Yorum ekleme endpoint'i
router.post("/add", async (req, res) => {
    try {
        const { remarkId, text, files, currentstatus, user } = req.body;
        // Yeni bir yorum oluştur
        const newComment = new Comment({ remarkId, text, files, currentstatus, user  });
        await newComment.save();
        const allComments = await Comment.find({ remarkId: remarkId }).populate('files');

        res.json({ success: true, message: "Yorum başarıyla eklendi.", comments: allComments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Yorum eklenirken bir hata oluştu." });
    }
});

router.post("/add-comment", async (req, res) => {
  try {
      const { remarkId, text, fileIds, currentstatus, user } = req.body;
      
      // Yeni bir yorum oluştur
      const newComment = new Comment({ remarkId, text, files: fileIds, currentstatus, user });
      await newComment.save();

      // Yorum ekledikten sonra, bu remarkId'ye ait tüm yorumları bulun
      const allComments = await Comment.find({ remarkId: remarkId }).populate('files');

      res.json({ success: true, message: "Yorum başarıyla eklendi.", comments: allComments });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Yorum eklenirken bir hata oluştu." });
  }
});
// Yorumları ve bu yorumlara ilişkin dosyaları getiren endpoint
router.get("/remarks/:remarkId/comments", async (req, res) => {
    try {
      const remarkId = req.params.remarkId;
      const comments = await Comment.find({ remarkId: remarkId }).populate('files');
      res.json({ success: true, comments: comments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Comments çekilirken bir hata oluştu." });
    }
  });

// Belirli bir Remark ID'ye ait tüm yorumları getiren endpoint
router.get("/:remarkId", async (req, res) => {
    try {
        const remarkId = req.params.remarkId; // Remark ID'sini al
        // Veritabanından belirli bir Remark ID'ye ait tüm yorumları bul
        const comments = await Comment.find({ remarkId: remarkId }).populate('files');
        res.json({ success: true, comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Yorumları getirirken bir hata oluştu." });
    }
});

module.exports = router;
