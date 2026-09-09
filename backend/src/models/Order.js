const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // آیدی پروژه‌ای که کاربر انتخاب کرده
    projectName: { type: String, required: true }, // نام تیزر/پروژه الگو
    companyName: { type: String, default: '' }, // نام شرکت صاحب پروژه الگو
    customerName: { type: String, required: true }, // نام شخصی که سفارش میده
    customerBrand: { type: String, default: '' }, // برند شخص سفارش دهنده
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    description: { type: String, default: '' },
    isRead: { type: Boolean, default: false } // برای مارک کردن در پنل ادمین
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);