const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Project = require('../models/Project');

const videoDir = path.join(__dirname, '../../uploads/videos');

// 🧠 محاسبه هش فایل برای پیدا کردن کپی‌های دقیق
const calculateHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

// 🟢 دریافت تمام ویدیوها و کشف فایل‌های تکراری
exports.getAllMedia = async (req, res) => {
    try {
        if (!fs.existsSync(videoDir)) return res.status(200).json({ success: true, data: [] });

        const files = await fsPromises.readdir(videoDir);
        let mediaList = [];

        for (const file of files) {
            const filePath = path.join(videoDir, file);
            const stats = await fsPromises.stat(filePath);

            if (stats.isFile()) {
                const relativePath = `/uploads/videos/${file}`;
                const isUsed = await Project.exists({ videos: relativePath });

                mediaList.push({
                    id: file,
                    name: file,
                    url: relativePath,
                    sizeBytes: stats.size,
                    sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                    createdAt: stats.birthtime,
                    isUsed: !!isUsed,
                    isDuplicate: false // پیش‌فرض: تکراری نیست
                });
            }
        }

        // 🧠 الگوریتم کشف تکراری‌ها (فقط فایل‌های هم‌سایز رو چک می‌کنیم تا سریع باشه)
        const sizeMap = {};
        mediaList.forEach(file => {
            if (!sizeMap[file.sizeBytes]) sizeMap[file.sizeBytes] = [];
            sizeMap[file.sizeBytes].push(file);
        });

        for (const size in sizeMap) {
            if (sizeMap[size].length > 1) { // اگر بیش از یک فایل با این حجم وجود داشت
                const hashMap = {};
                for (const file of sizeMap[size]) {
                    const filePath = path.join(videoDir, file.name);
                    const hash = await calculateHash(filePath);
                    if (!hashMap[hash]) hashMap[hash] = [];
                    hashMap[hash].push(file);
                }
                // مارک کردن فایل‌های کپی
                for (const hash in hashMap) {
                    if (hashMap[hash].length > 1) {
                        hashMap[hash].forEach(f => {
                            // تمام نسخه‌های این فایل رو علامت می‌زنیم
                            const target = mediaList.find(m => m.name === f.name);
                            if (target) target.isDuplicate = true;
                        });
                    }
                }
            }
        }

        // سورت کردن از حجیم‌ترین به سبک‌ترین
        mediaList.sort((a, b) => b.sizeBytes - a.sizeBytes);

        res.status(200).json({ success: true, data: mediaList });
    } catch (error) {
        console.error('[MediaController - getAllMedia]:', error);
        res.status(500).json({ success: false, message: 'خطای سرور در خواندن فایل‌ها' });
    }
};

// 🔴 حذف یک ویدیو
exports.deleteMedia = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(videoDir, filename);

        if (!filePath.startsWith(videoDir)) return res.status(403).json({ success: false, message: 'دسترسی غیرمجاز' });

        if (fs.existsSync(filePath)) {
            await fsPromises.unlink(filePath);
            const relativePath = `/uploads/videos/${filename}`;
            await Project.updateMany(
                { videos: relativePath },
                { $pull: { videos: relativePath } }
            );
            res.status(200).json({ success: true, message: 'ویدیو با موفقیت حذف شد.' });
        } else {
            res.status(404).json({ success: false, message: 'فایل مورد نظر پیدا نشد.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطا در حذف ویدیو' });
    }
};