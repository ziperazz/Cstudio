const User = require('../models/User');

// [GET] دریافت لیست تمام کاربران
exports.getUsers = async (req, res) => {
    try {
        // پسوردها رو با select('-password') از خروجی حذف می‌کنیم که سمت فرانت ارسال نشه
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error(`[UserController - getUsers] ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// [POST] ایجاد کاربر جدید
exports.createUser = async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        // بررسی اینکه آیا نام کاربری تکراری است یا خیر
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'نام کاربری قبلاً در سیستم ثبت شده است!'
            });
        }

        const newUser = await User.create({
            name,
            username,
            password, // در مدل User.js به صورت خودکار هش می‌شود
            role
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error(`[UserController - createUser] ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// [DELETE] حذف کاربر
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // جلوگیری از حذف اکانت مدیر اصلی سایت
        if (user.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'شما اجازه حذف مدیر کل سیستم را ندارید!'
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(`[UserController - deleteUser] ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// [PUT] تغییر رمز عبور کاربر
exports.updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'کاربر یافت نشد.' });
        }

        // جایگزینی رمز جدید (هوک mongoose که قبلاً نوشتیم خودش زحمت هش کردن رو میکشه)
        user.password = password;
        await user.save();

        res.status(200).json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد.' });
    } catch (error) {
        console.error(`[UserController - updatePassword] ${error.message}`);
        res.status(500).json({ success: false, message: 'خطای سرور' });
    }
};