const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'نام کاربری الزامی است'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'رمز عبور الزامی است'],
        minlength: [6, 'رمز عبور باید حداقل 6 کاراکتر باشد']
    }
}, { timestamps: true });

// 🎯 اصلاح شد: در Mongoose جدید، توابع async نیازی به next ندارند
adminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// یک متد اختصاصی برای مقایسه رمز عبوری که کاربر زده با رمز هش شده‌ی داخل دیتابیس
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);