const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ساخت اتوماتیک فولدرها در صورت عدم وجود
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'uploads/';
        if (file.mimetype.startsWith('video/')) {
            dest += 'videos/';
        } else if (file.mimetype.startsWith('image/')) {
            dest += 'screenshots/';
        }
        createDir(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // تولید اسم یونیک برای فایل‌ها تا تداخل پیش نیاد
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// فیلتر کردن فایل‌های غیرمجاز
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('فقط آپلود ویدیو و عکس مجاز است!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // محدودیت 100 مگابایتی برای هر فایل
});

module.exports = upload;