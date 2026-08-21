const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    teaserName: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    bottomText: {
        type: String,
        trim: true
    },
    // 🚀 فیلد اولویت اضافه شد (۱ بالاترین، ۵ پایین‌ترین)
    priority: {
        type: Number,
        required: true,
        min: [1, 'اولویت نمی‌تواند کمتر از ۱ باشد'],
        max: [5, 'اولویت نمی‌تواند بیشتر از ۵ باشد'],
        default: 5
    },
    videos: {
        type: [String],
        required: true,
        validate: [
            (val) => val.length >= 1 && val.length <= 2,
            'تعداد ویدیوها باید حداقل ۱ و حداکثر ۲ فایل باشد.'
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🎯 ساخت اتوماتیک اسلاگ فارسی و سئوفرندلی
projectSchema.pre('save', async function () {
    if (this.isModified('companyName') || this.isModified('teaserName') || !this.slug) {
        let baseSlug = `${this.companyName}-${this.teaserName}`
            .trim()
            .replace(/[\s\u200C]+/g, '-')
            .replace(/[^\w\u0600-\u06FF\-]+/g, '')
            .replace(/^-+|-+$/g, '');

        const Project = mongoose.model('Project');
        let slug = baseSlug;
        let counter = 1;
        while (await Project.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
});

module.exports = mongoose.model('Project', projectSchema);