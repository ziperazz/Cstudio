const ClientFolder = require('../models/ClientFolder');

// ==========================================
// 🛠️ بخش ادمین اصلی (Super Admin)
// ==========================================

// ساخت فولدر جدید و اختصاص دادن به مشتری
exports.createFolder = async (req, res) => {
    try {
        const { title, description, driveLink, coverImage, client } = req.body;

        if (!title || !driveLink || !client) {
            return res.status(400).json({ success: false, message: 'عنوان، لینک درایو و انتخاب مشتری الزامی است.' });
        }

        const folder = await ClientFolder.create({
            title, description, driveLink, coverImage, client
        });

        res.status(201).json({ success: true, data: folder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطا در ایجاد فولدر مشتری' });
    }
};

// گرفتن لیست تمام فولدرها (برای پنل ادمین اصلی)
exports.getAllFolders = async (req, res) => {
    try {
        const folders = await ClientFolder.find().populate('client', 'name username');
        res.status(200).json({ success: true, data: folders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در دریافت اطلاعات' });
    }
};

// ==========================================
// 👤 بخش مشتری (Client / Page Admin)
// ==========================================

// مشتری لاگین کرده و فقط فولدرهای خودش رو می‌بینه
exports.getMyFolders = async (req, res) => {
    try {
        const clientId = req.user._id; // آیدی مشتری که لاگین کرده

        const folders = await ClientFolder.find({ client: clientId })
            .select('-createdAt -updatedAt -__v') // فیلدهای اضافه رو نمیفرستیم
            .sort({ _id: -1 });

        res.status(200).json({ success: true, count: folders.length, data: folders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطا در دریافت فایل‌های شما' });
    }
};