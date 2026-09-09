const Contact = require('../models/Contact');
const axios = require('axios');

exports.submitContact = async (req, res) => {
    try {
        // دریافت فیلدهای جدید از بادی درخواست
        const { name, brand, services, phone, email, message } = req.body;

        // اعتبارسنجی فقط برای فیلدهای اجباری
        if (!name || !phone || !services || services.length === 0) {
            return res.status(400).json({ success: false, message: 'لطفاً فیلدهای ضروری را پر کنید.' });
        }

        // ۱. ذخیره در دیتابیس
        const newContact = await Contact.create({
            name,
            brand,
            services,
            phone,
            email,
            message
        });

        // ۲. متغیرهای تلگرام و بله
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;

        const baleToken = process.env.BALE_BOT_TOKEN;
        const baleChatId = process.env.BALE_CHAT_ID;

        // ساختن متن تمیز برای ربات (فیلدهای خالی نمایش داده نمیشن)
        const brandText = brand ? `🏢 برند/شرکت: ${brand}\n` : '';
        const emailText = email ? `📧 ایمیل: ${email}\n` : '';
        const messageText = message ? `📝 توضیحات:\n${message}\n` : '';
        const servicesText = services.join('، '); // تبدیل آرایه به متن جدا شده با کاما

        const text = `درخواست جدید از C STUDIO!\n\n نام: ${name}\n${brandText} تماس: ${phone}\n${emailText} خدمات درخواستی: ${servicesText}\n\n${messageText}`;

        // ==========================================
        // 🚀 ارسال به تلگرام (با پروکسی)
        // ==========================================
        if (tgToken && tgChatId) {
            try {
                await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                    chat_id: tgChatId,
                    text: text
                }, {
                    proxy: { protocol: 'http', host: '127.0.0.1', port: 10809 } // پورت فیلترشکنت
                });
                console.log("✅ پیام به تلگرام ارسال شد.");
            } catch (err) {
                console.error("❌ خطا در ارسال به تلگرام:", err.message);
            }
        }

        // ==========================================
        // 🚀 ارسال به بله (بدون پروکسی و مستقیم)
        // ==========================================
        if (baleToken && baleChatId) {
            try {
                await axios.post(`https://tapi.bale.ai/bot${baleToken}/sendMessage`, {
                    chat_id: baleChatId,
                    text: text
                });
                console.log("✅ پیام به بله ارسال شد.");
            } catch (err) {
                console.error("❌ خطا در ارسال به بله:", err.message);
            }
        }

        // ۳. پاسخ موفقیت به فرانت‌اند
        res.status(201).json({
            success: true,
            message: 'درخواست با موفقیت ثبت شد.',
            data: newContact
        });

    } catch (error) {
        console.error('خطای کلی ثبت فرم تماس:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// 🎯 گرفتن تمام پیام‌ها (برای پنل ادمین)
exports.getContacts = async (req, res) => {
    try {
        // پیام‌ها رو بر اساس جدیدترین مرتب می‌کنیم
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        console.error('خطا در دریافت پیام‌ها:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// 🎯 مارک کردن پیام به عنوان "خوانده شده"
exports.markAsRead = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({ success: false, message: 'پیام یافت نشد.' });
        }
        res.status(200).json({ success: true, data: contact });
    } catch (error) {
        console.error('خطا در آپدیت پیام:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// 🎯 حذف یک پیام
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'پیام یافت نشد.' });
        }
        res.status(200).json({ success: true, message: 'پیام حذف شد.' });
    } catch (error) {
        console.error('خطا در حذف پیام:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};