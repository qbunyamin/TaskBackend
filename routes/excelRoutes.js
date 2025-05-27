const express = require('express');
const path = require('path');
const router = express.Router();

// Excel dosyasını indirmek için bir endpoint
router.get('/download-template', (req, res) => {
  const filePath = path.join(__dirname, '../templates/tank_pipe_penetration_template.xlsx');
  res.download(filePath);  // Dosyayı indirir
});

module.exports = router;
