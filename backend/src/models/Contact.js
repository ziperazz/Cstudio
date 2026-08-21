const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, default: '' }, // نام برند (اختیاری)
    services: { type: [String], required: true }, // آرایه‌ای از خدمات انتخابی
    phone: { type: String, required: true },
    email: { type: String, default: '' }, // ایمیل (اختیاری)
    message: { type: String, default: '' }, // توضیحات (اختیاری)
    isRead: { type: Boolean, default: false } // برای پنل ادمین
}, {
    timestamps: true // تاریخ و ساعت ثبت رو اتوماتیک ذخیره میکنه
});

module.exports = mongoose.model('Contact', contactSchema);