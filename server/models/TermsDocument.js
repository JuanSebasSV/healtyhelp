const mongoose = require('mongoose');

const termsDocumentSchema = new mongoose.Schema({
  version:   { type: String, required: true },   
  content:   { type: String, required: true },   
  publishedAt: { type: Date, default: Date.now },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TermsDocument', termsDocumentSchema);
