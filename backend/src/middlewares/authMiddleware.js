const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User'); // 👈 مدل مشتری‌ها رو هم اینجا ایمپورت کن

// ==========================================
// ۱. نگهبان ادمین اصلی (مخصوص پنل مدیریت تو)
// ==========================================
exports.protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'شما دسترسی ندارید! لطفاً وارد شوید.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // جستجو فقط در دیتابیس ادمین‌ها
        req.admin = await Admin.findById(decoded.id).select('-password');

        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'ادمین یافت نشد یا دسترسی غیرمجاز است.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'توکن نامعتبر است یا منقضی شده.' });
    }
};

// ==========================================
// ۲. نگهبان مشتریان (مخصوص داشبورد مشتری برای دانلود ویدیو)
// ==========================================
exports.protectClient = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'شما دسترسی ندارید! لطفاً وارد شوید.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🎯 اینجا به جای Admin، تو دیتابیس User دنبالش می‌گردیم
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'کاربر یافت نشد یا دسترسی غیرمجاز است.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'توکن نامعتبر است یا منقضی شده.' });
    }
};