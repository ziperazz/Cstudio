const mongoose = require('mongoose');

const clientFolderSchema = new mongoose.Schema({
    title: { type: String, required: true }, // مثلا: کمپین تبلیغاتی پاییز
    description: { type: String }, // توضیحات کوتاه برای مشتری
    driveLink: { type: String, required: true }, // لینک گوگل درایو
    coverImage: { type: String, default: '/default-folder.jpg' }, // یک عکس کاور برای زیبایی پنل مشتری

    // 🎯 وصل کردن این فولدر به مشتری خاص (Page Admin)
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // اشاره به مدل مشتری‌ها
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ClientFolder', clientFolderSchema);