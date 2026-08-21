const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
}, { timestamps: true });

// 🟢 هوک هش کردن پسورد (کاملاً استاندارد و مدرن، بدون next)
userSchema.pre('save', async function () {
    // اگر پسورد تغییر نکرده بود، بدون هش کردن دوباره رد شو
    if (!this.isModified('password')) {
        return;
    }

    // تولید نمک (salt) و هش کردن پسورد
    // نیازی به try-catch و next نیست، مونگوس خودش هندل می‌کنه
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// متد مقایسه پسورد (برای زمان لاگین)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);