const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
  token: { type: String, required: true },
  createdAt: { type: Date, expires: '24h', default: Date.now } // Token 24 saat sonra otomatik olarak silinecek
});

module.exports = mongoose.model('Token', tokenSchema);