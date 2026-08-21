const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');

// 🟢 [POST] ایجاد پروژه جدید
exports.createProject = async (req, res) => {
    try {
        const { companyName, teaserName, description, bottomText, priority } = req.body || {};
        const videoFiles = req.files && req.files['videos'] ? req.files['videos'] : [];

        if (!companyName || !teaserName || !description) {
            return res.status(400).json({
                success: false,
                message: 'فیلدهای نام شرکت، نام تیزر و توضیحات الزامی هستند.'
            });
        }

        if (videoFiles.length === 0 || videoFiles.length > 2) {
            return res.status(400).json({
                success: false,
                message: 'حداقل ۱ و حداکثر ۲ ویدیو باید آپلود کنید.'
            });
        }

        const videosPath = videoFiles.map(file => `/uploads/videos/${file.filename}`);

        // ذخیره در دیتابیس MongoDB
        const newProject = await Project.create({
            companyName,
            teaserName,
            description,
            bottomText,
            priority: priority ? Number(priority) : 5,
            videos: videosPath
        });

        res.status(201).json({
            success: true,
            message: 'پروژه با موفقیت ایجاد شد!',
            data: newProject
        });

    } catch (error) {
        console.error('[ProjectController - createProject Error]:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور', error: error.message });
    }
};

// 🟢 دریافت لیست تمام پروژه‌ها
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ priority: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};

// 🔴 حذف پروژه و فایل‌های ویدیویی آن
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'پروژه یافت نشد.' });
        }

        if (project.videos && project.videos.length > 0) {
            project.videos.forEach(videoPath => {
                const fullPath = path.join(__dirname, '../../', videoPath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
        }

        await Project.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'پروژه و ویدیوهای مربوط به آن با موفقیت حذف شدند.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};

// 🔍 دریافت یک پروژه با استفاده از آیدی
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'پروژه یافت نشد.' });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};

// 🔍 دریافت پروژه بر اساس اسلاگ
exports.getProjectBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const project = await Project.findOne({ slug });

        if (!project) {
            return res.status(404).json({ success: false, message: 'پروژه مورد نظر یافت نشد.' });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error(`[ProjectController - getProjectBySlug] ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
// 🟡 [PUT] ویرایش اطلاعات و فایل‌های ویدیویی پروژه (نسخه ضد-خطا و دیباگ)
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('--- [DEBUG] UPDATE REQUEST BODY:', req.body);
        console.log('--- [DEBUG] UPDATE REQUEST FILES:', req.files);

        const body = req.body || {};
        const { companyName, teaserName, description, bottomText, priority, existingVideos } = body;

        // دریافت فایل‌های ویدیویی جدید
        const newVideoFiles = req.files && req.files['videos'] ? req.files['videos'] : [];

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'پروژه یافت نشد.' });
        }

        // تبدیل امن لیست ویدیوهای قدیمی
        let keptVideos = [];
        if (existingVideos) {
            if (Array.isArray(existingVideos)) {
                keptVideos = existingVideos;
            } else if (typeof existingVideos === 'string') {
                try {
                    keptVideos = JSON.parse(existingVideos);
                } catch (e) {
                    keptVideos = [existingVideos];
                }
            }
        }

        // 🗑️ پاک کردن ویدیوهایی که کاربر حذف کرده از روی سرور
        if (project.videos && Array.isArray(project.videos)) {
            project.videos.forEach(videoPath => {
                if (!keptVideos.includes(videoPath)) {
                    const fullPath = path.join(__dirname, '../../', videoPath);
                    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                }
            });
        }

        // ➕ ساخت مسیر برای ویدیوهای جدید
        const newVideoPaths = newVideoFiles.map(file => `/uploads/videos/${file.filename}`);

        // ترکیب ویدیوهای نگه داشته شده + ویدیوهای جدید
        const finalVideos = [...keptVideos, ...newVideoPaths];

        console.log('--- [DEBUG] Kept Videos:', keptVideos);
        console.log('--- [DEBUG] New Videos:', newVideoPaths);
        console.log('--- [DEBUG] Final Videos Count:', finalVideos.length);

        if (finalVideos.length === 0 || finalVideos.length > 2) {
            return res.status(400).json({
                success: false,
                message: 'مجموع ویدیوها باید حداقل ۱ و حداکثر ۲ فایل باشد.',
                debugCount: finalVideos.length
            });
        }

        // آپدیت فیلدها
        project.companyName = companyName || project.companyName;
        project.teaserName = teaserName || project.teaserName;
        project.description = description || project.description;
        project.bottomText = bottomText !== undefined ? bottomText : project.bottomText;
        project.priority = priority ? Number(priority) : project.priority;
        project.videos = finalVideos;

        await project.save();

        res.status(200).json({
            success: true,
            message: 'پروژه و ویدیوها با موفقیت ویرایش شدند.',
            data: project
        });
    } catch (error) {
        console.error('[UpdateProject Error]:', error);
        res.status(500).json({ success: false, message: 'خطای سرور', error: error.message });
    }
};