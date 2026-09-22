const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔑 تولید توکن JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// ==========================================
// 🟢 ورود ادمین اصلی (Admin Login)
// ==========================================
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        res.status(200).json({
            success: true,
            message: 'با موفقیت وارد شدید.',
            token: generateToken(admin._id)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};

// ==========================================
// 🔵 ساخت اولین ادمین
// ==========================================
exports.registerFirstAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const adminExists = await Admin.findOne();
        if (adminExists) {
            return res.status(403).json({ success: false, message: 'ادمین قبلاً ثبت شده است.' });
        }

        const admin = await Admin.create({ username, password });

        res.status(201).json({
            success: true,
            message: 'اولین ادمین با موفقیت ساخته شد!',
            admin: { username: admin.username }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};

// ==========================================
// 🟠 ورود مشتری (Client Login)
// ==========================================
exports.loginClient = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
        }

        const client = await User.findOne({ username }).select('+password');
        if (!client) {
            return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        const isMatch = await client.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        if (client.isActive === false) {
            return res.status(403).json({ success: false, message: 'حساب کاربری شما موقتاً مسدود شده است.' });
        }

        res.status(200).json({
            success: true,
            message: 'با موفقیت وارد شدید.',
            token: generateToken(client._id),
            client: {
                id: client._id,
                name: client.name,
                username: client.username
            }
        });

    } catch (error) {
        console.error('Login Client Error:', error);
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};
// ==========================================
// 🔐 اطلاعات ادمین لاگین‌شده (Who am I)
// ==========================================
exports.getAdminProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                id: req.admin._id,
                username: req.admin.username,
                createdAt: req.admin.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};

// ==========================================
// 🔑 تغییر رمز عبور پنل ادمین
// ==========================================
exports.changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'رمز عبور فعلی و رمز عبور جدید الزامی است.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد.' });
        }

        // req.admin از protectAdmin می‌آید و بدون فیلد password است، پس دوباره کامل می‌خوانیم
        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'ادمین یافت نشد.' });
        }

        const isMatch = await admin.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'رمز عبور فعلی اشتباه است.' });
        }

        // هش شدن رمز در هوک pre('save') مدل Admin انجام می‌شود
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید.',
            // توکن جدید تا ادمین بدون قطع شدن دسترسی بتواند ادامه دهد
            token: generateToken(admin._id)
        });

    } catch (error) {
        console.error('Change Admin Password Error:', error);
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};
