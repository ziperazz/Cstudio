const Order = require('../models/Order');
const axios = require('axios');

exports.submitOrder = async (req, res) => {
    try {
        // دریافت دیتا از فرانت‌اند (Task 7)
        const { projectId, projectName, companyName, customerName, customerBrand, customerPhone, customerEmail, description } = req.body;

        // اعتبارسنجی
        if (!customerName || !customerPhone || !projectName) {
            return res.status(400).json({ success: false, message: 'لطفاً فیلدهای ضروری را پر کنید.' });
        }

        // ۱. ذخیره در دیتابیس
        const newOrder = await Order.create({
            projectId,
            projectName,
            companyName,
            customerName,
            customerBrand,
            customerPhone,
            customerEmail,
            description
        });

        // ۲. متغیرهای ربات‌ها
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;
        const baleToken = process.env.BALE_BOT_TOKEN;
        const baleChatId = process.env.BALE_CHAT_ID;

        // ساخت متن تمیز و اختصاصی برای سفارش پروژه
        const brandText = customerBrand ? ` برند مشتری: ${customerBrand}\n` : '';
        const emailText = customerEmail ? ` ایمیل: ${customerEmail}\n` : '';
        const descText = description ? ` توضیحات:\n${description}\n` : '';
        const companyText = companyName ? ` (متعلق به: ${companyName})` : '';

        const text = `ثبت سفارش ویدیوی جدید!\n\n نام مشتری: ${customerName}\n${brandText} تماس: ${customerPhone}\n${emailText}\n ویدیوی درخواستی:\n ${projectName}${companyText}\n\n${descText}`;

        // ==========================================
        // 🚀 ارسال به تلگرام (با پروکسی)
        // ==========================================
        if (tgToken && tgChatId) {
            try {
                await axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                    chat_id: tgChatId,
                    text: text
                }, {
                    proxy: { protocol: 'http', host: '127.0.0.1', port: 10809 }
                });
                console.log("✅ سفارش پروژه به تلگرام ارسال شد.");
            } catch (err) {
                console.error("❌ خطا در ارسال سفارش به تلگرام:", err.message);
            }
        }

        // ==========================================
        // 🚀 ارسال به بله (مستقیم)
        // ==========================================
        if (baleToken && baleChatId) {
            try {
                await axios.post(`https://tapi.bale.ai/bot${baleToken}/sendMessage`, {
                    chat_id: baleChatId,
                    text: text
                });
                console.log("✅ سفارش پروژه به بله ارسال شد.");
            } catch (err) {
                console.error("❌ خطا در ارسال سفارش به بله:", err.message);
            }
        }

        // ۳. پاسخ موفقیت
        res.status(201).json({
            success: true,
            message: 'سفارش با موفقیت ثبت شد.',
            data: newOrder
        });

    } catch (error) {
        console.error('خطای کلی ثبت فرم سفارش:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// 🎯 گرفتن تمام سفارشات (برای پنل ادمین)
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('خطا در دریافت سفارشات:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// 🎯 مارک کردن سفارش به عنوان خوانده شده
exports.markAsRead = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, message: 'سفارش یافت نشد.' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('خطا در آپدیت سفارش:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};

// 🎯 حذف سفارش
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'سفارش یافت نشد.' });
        }
        res.status(200).json({ success: true, message: 'سفارش حذف شد.' });
    } catch (error) {
        console.error('خطا در حذف سفارش:', error);
        res.status(500).json({ success: false, message: 'خطای سرور.' });
    }
};