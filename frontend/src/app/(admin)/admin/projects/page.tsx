"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fetchWithAuth } from '@/utils/api';

// 🎯 وارد کردن فونت‌ها
import { orbitronFont, outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

// 🎯 تابع تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  if (num === undefined || num === null) return '۰';
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

// 🎯 مپ کردن آیدی دسته‌بندی‌ها به نام فارسی برای نمایش در لیست
const categoryMap: { [key: string]: string } = {
  'teaser': 'تیزر تبلیغاتی',
  'content': 'تولید محتوا',
  'product': 'معرفی محصول',
  'service': 'معرفی خدمات',
  'campaign': 'اجرای کمپین',
  'web': 'طراحی سایت'
};

interface Project {
  _id: string;
  companyName: string;
  teaserName: string;
  slug: string;
  description: string;
  bottomText?: string;
  category?: string; // 👈 اضافه شدن دسته‌بندی
  priority?: number; 
  videos: string[];
  createdAt: string;
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔍 استیت سرچ زنده
  const [searchQuery, setSearchQuery] = useState('');

  // 🚀 استیت‌های مربوط به مدال ویرایش
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: '',
    teaserName: '',
    description: '',
    bottomText: '',
    category: 'teaser', // 👈 مقدار دیفالت
    priority: 5
  });
  
  // 🎥 استیت‌های مدیریت ویدیو در ویرایش
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // 🔄 دریافت پروژه‌ها از بک‌اند
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error('خطا در دریافت پروژه‌ها', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔍 فیلتر کردن پروژه‌ها
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    
    return projects.filter(p => {
      const company = p.companyName?.toLowerCase() || '';
      const teaser = p.teaserName?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      return company.includes(query) || teaser.includes(query) || desc.includes(query);
    });
  }, [projects, searchQuery]);

  // 🗑️ حذف کل پروژه
  const handleDeleteProject = async (id: string) => {
    if (!confirm('آیا از حذف کامل این شاهکار و تمام فایل‌های ویدیویی آن اطمینان دارید؟')) return;
    try {
      const res = await fetchWithAuth(`/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== id));
      } else {
        alert('خطا در حذف پروژه');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🎯 باز کردن مدال ادیت و ست کردن دیتا و ویدیوها
  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      companyName: project.companyName || '',
      teaserName: project.teaserName || '',
      description: project.description || '',
      bottomText: project.bottomText || '',
      category: project.category || 'teaser', // 👈 ست کردن کتگوریِ فعلیِ پروژه
      priority: project.priority || 5
    });
    setExistingVideos(project.videos || []);
    setNewVideoFiles([]);
    setIsEditModalOpen(true);
    document.body.style.overflow = 'hidden'; 
  };

  // 🎯 بستن مدال ادیت
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => setEditingProject(null), 300); 
    document.body.style.overflow = '';
  };

  // 🎥 هندل کردن افزودن ویدیو جدید در حالت ادیت
  const handleEditVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalAllowed = 2 - existingVideos.length; 
      
      setNewVideoFiles((prevFiles) => {
        const combinedFiles = [...prevFiles, ...selectedFiles];
        if (combinedFiles.length > totalAllowed) {
          alert(`حداکثر می‌توانید ${totalAllowed} ویدیوی جدید اضافه کنید.`);
          return combinedFiles.slice(0, totalAllowed);
        }
        return combinedFiles;
      });
      
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  // 🗑️ حذف ویدیوی قدیمی
  const handleRemoveExistingVideo = (videoPath: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExistingVideos(existingVideos.filter(v => v !== videoPath));
  };

  // 🗑️ حذف ویدیوی جدید
  const handleRemoveNewVideo = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setNewVideoFiles(newVideoFiles.filter((_, idx) => idx !== index));
  };

  // 🚀 ذخیره تغییرات پروژه 
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const totalVideos = existingVideos.length + newVideoFiles.length;
    if (totalVideos === 0 || totalVideos > 2) {
      alert('مجموع ویدیوهای پروژه باید ۱ الی ۲ فایل باشد.');
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('companyName', editForm.companyName);
      formData.append('teaserName', editForm.teaserName);
      formData.append('description', editForm.description);
      formData.append('bottomText', editForm.bottomText);
      formData.append('category', editForm.category); // 👈 ارسال کتگوری به بک‌اند برای آپدیت
      formData.append('priority', editForm.priority.toString());
      
      formData.append('existingVideos', JSON.stringify(existingVideos));
      
      newVideoFiles.forEach(file => {
        formData.append('videos', file);
      });

      const res = await fetchWithAuth(`/projects/${editingProject._id}`, {
        method: 'PUT',
        body: formData 
      });
      
      const data = await res.json();

      if (data.success) {
        setProjects(projects.map(p => p._id === editingProject._id ? data.data : p));
        closeEditModal();
      } else {
        alert(data.message || 'خطا در ویرایش پروژه');
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.play().catch(() => {});
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    e.currentTarget.currentTime = 0; 
  };

  const totalCurrentVideos = existingVideos.length + newVideoFiles.length;

  return (
    <div className="w-full flex flex-col gap-8 pb-10 px-4 md:px-8 mt-6" style={{ fontFamily: persianFontFamily }} dir="rtl">
      
      {/* ---------------- 📝 هدر صفحه و نوار ابزار ---------------- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-6 md:pb-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">مدیریت نمونه‌کارها</h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light">
            ویرایش، حذف، فیلتر و مدیریت چیدمان پروژه‌های استودیو به صورت زنده.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="جستجو در برند، تیزر یا توضیحات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/5 text-sm text-white rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-all shadow-lg"
            />
          </div>

          <Link 
            href="/admin/projects/new"
            className="w-full sm:w-auto bg-white text-black font-bold px-6 py-4 rounded-xl hover:bg-zinc-200 transition-all duration-300 text-sm flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-1 shrink-0"
          >
            <span className="mt-0.5">افزودن پروژه جدید</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </Link>
        </div>
      </div>

      {/* ---------------- 🗂️ لیست پروژه‌ها ---------------- */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111] border border-white/5 rounded-[32px] p-16 flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <div className="w-24 h-24 bg-[#050505] border border-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-600">
            {searchQuery ? (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            ) : (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            )}
          </div>
          <p className="text-white text-xl mb-3 font-bold">
            {searchQuery ? 'پروژه‌ای با این مشخصات یافت نشد.' : 'هیچ شاهکاری در دیتابیس یافت نشد.'}
          </p>
          {!searchQuery && (
            <Link href="/admin/projects/new" className="text-zinc-400 text-sm hover:text-white transition-colors border border-white/10 px-6 py-2.5 rounded-full mt-4 font-bold">
              همین الان اولین پروژه رو آپلود کن
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div 
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="bg-[#111111] border border-white/5 hover:border-white/10 rounded-[24px] overflow-hidden flex flex-col justify-between group transition-all shadow-2xl relative"
              >
                {/* 🚀 برچسب دسته‌بندی پروژه */}
                {project.category && (
                  <div className={`absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg`}>
                    {categoryMap[project.category] || project.category}
                  </div>
                )}

                {/* برچسب اولویت روی عکس */}
                {project.priority && (
                  <div className={`absolute top-4 right-4 z-20 bg-white text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] ${outfitFont.className}`}>
                    {project.priority}
                  </div>
                )}

                <div>
                  {/* 🖼️ پیش‌نمایش ویدیویی */}
                  <div className="w-full h-64 bg-[#050505] relative overflow-hidden">
                    {project.videos && project.videos.length > 0 ? (
                      <>
                        <video 
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${project.videos[0]}`}
                          muted 
                          loop 
                          playsInline
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-100 pointer-events-none" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="w-14 h-14 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                            <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900/20">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        <span className="mt-3 text-sm font-bold">بدون فایل ویدیویی</span>
                      </div>
                    )}
                    
                    {/* 🎞️ نشانگر تعداد ویدیوها */}
                    {project.videos && project.videos.length > 0 && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white font-medium shadow-lg pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        {toPersianDigits(project.videos.length)} ویدیو
                      </div>
                    )}
                  </div>

                  <div className="p-6 relative z-10 -mt-6">
                    <h3 className="text-white/50 font-bold text-xs mb-1 uppercase tracking-widest">{project.companyName || 'بدون نام شرکت'}</h3>
                    <h2 className="text-white font-bold text-2xl mb-3 line-clamp-1">{project.teaserName || 'بدون نام تیزر'}</h2>
                    <p className="text-zinc-400 text-sm line-clamp-2 leading-loose">{project.description || 'بدون توضیحات'}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-wrap items-center justify-between mt-auto gap-4">
                  <Link 
                    href={`/works/${project.slug}`}
                    target="_blank"
                    className="text-white text-xs hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-white/10 hover:border-white/30 font-bold"
                  >
                    نمایش زنده
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(project)}
                      className="text-zinc-400 hover:text-white bg-[#050505] hover:bg-white/10 w-11 h-11 flex items-center justify-center rounded-xl transition-all border border-zinc-800 hover:border-white/30"
                      title="ویرایش اطلاعات و اولویت"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project._id)}
                      className="text-red-400 hover:text-red-300 bg-[#050505] hover:bg-red-500/20 w-11 h-11 flex items-center justify-center rounded-xl transition-all border border-zinc-800 hover:border-red-500/30"
                      title="حذف دائمی پروژه"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🚀 مدال ویرایش پروژه (پاپ‌آپ با قابلیت ویرایش ویدیو و دسته‌بندی) */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute inset-0 cursor-pointer"
              onClick={closeEditModal}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111111] border border-white/10 w-full max-w-4xl rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative z-10"
            >
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

              <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-white rounded-full"></div>
                  <h2 className="text-white font-bold text-xl md:text-2xl tracking-tight">ویرایش پروژه</h2>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="w-10 h-10 bg-[#050505] border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar relative z-10">
                <form id="editForm" onSubmit={handleUpdateProject} className="flex flex-col gap-6 md:gap-8">
                  
                  {/* 🎥 بخش مدیریت ویدیوها در ادیت */}
                  <div className="flex flex-col gap-4 p-6 md:p-8 bg-[#050505] border border-white/10 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-white text-base font-bold tracking-wide">مدیریت فایل‌های ویدیویی</label>
                        <span className="text-zinc-500 text-xs font-light">ویدیوهای قدیمی را حذف یا فایل جدید اضافه کنید (حداکثر ۲ ویدیو).</span>
                      </div>
                      <span className={`text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg ${outfitFont.className} font-bold`}>
                        {totalCurrentVideos} / 2
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                      {existingVideos.map((vid, idx) => (
                        <div key={`old-${idx}`} className="flex items-center justify-between bg-[#111111] border border-white/10 px-4 py-3.5 rounded-xl shadow-inner group">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                            </div>
                            <span dir="ltr" className="truncate text-zinc-300 text-sm font-mono tracking-wider">...{vid.split('/').pop()}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">از قبل آپلود شده</span>
                          </div>
                          <button 
                            onClick={(e) => handleRemoveExistingVideo(vid, e)}
                            className="w-9 h-9 shrink-0 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
                            title="حذف از روی سرور"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      ))}

                      {newVideoFiles.map((f, idx) => (
                        <div key={`new-${idx}`} className="flex items-center justify-between bg-[#111111] border border-white/10 px-4 py-3.5 rounded-xl shadow-inner group">
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <span dir="ltr" className="truncate text-white text-sm font-mono tracking-wider">{f.name}</span>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 whitespace-nowrap animate-pulse">فایل جدید</span>
                          </div>
                          <button 
                            onClick={(e) => handleRemoveNewVideo(idx, e)}
                            className="w-9 h-9 shrink-0 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
                            title="لغو انتخاب"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      ))}

                      {totalCurrentVideos < 2 && (
                        <div className="relative mt-2">
                          <input 
                            ref={editFileInputRef} type="file" accept="video/*" multiple onChange={handleEditVideoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full border-2 border-dashed border-white/20 hover:border-white/50 bg-[#111111] hover:bg-white/5 rounded-xl p-5 flex flex-col items-center justify-center transition-all">
                            <div className="w-10 h-10 rounded-full bg-[#050505] text-white mb-2 flex items-center justify-center shadow-inner">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </div>
                            <span className="text-white text-sm font-bold">انتخاب فایل ویدیویی جدید</span>
                            <span className="text-zinc-500 text-xs mt-1">شما می‌توانید {toPersianDigits(2 - totalCurrentVideos)} فایل دیگر اضافه کنید</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-white text-sm font-bold tracking-wide">نام برند / شرکت</label>
                      <input 
                        type="text" value={editForm.companyName} onChange={(e) => setEditForm({...editForm, companyName: e.target.value})} required
                        className="w-full h-14 px-5 bg-[#050505] border border-white/10 rounded-2xl text-white focus:border-white/50 transition-all text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-white text-sm font-bold tracking-wide">نام تیزر</label>
                      <input 
                        type="text" value={editForm.teaserName} onChange={(e) => setEditForm({...editForm, teaserName: e.target.value})} required
                        className="w-full h-14 px-5 bg-[#050505] border border-white/10 rounded-2xl text-white focus:border-white/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* 🚀 ردیف دسته‌بندی و اولویت در ادیت */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#050505] border border-white/5 rounded-2xl">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-white text-sm font-bold tracking-wide">دسته‌بندی پروژه</label>
                        <span className="text-zinc-500 text-xs font-bold">دسته‌بندی این پروژه را تغییر دهید.</span>
                      </div>
                      <div className="relative w-full">
                        <select 
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          className="w-full h-14 px-5 bg-[#111111] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/50 transition-all text-sm appearance-none cursor-pointer"
                        >
                          <option value="teaser">تیزر تبلیغاتی</option>
                          <option value="content">تولید محتوا</option>
                          <option value="product">معرفی محصول</option>
                          <option value="service">معرفی خدمات</option>
                          <option value="campaign">اجرای کمپین</option>
                          <option value="web">طراحی سایت</option>
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-white text-sm font-bold tracking-wide">اولویت نمایش</label>
                        <span className="text-zinc-500 text-xs font-bold">۱ (بالاترین) تا ۵ (پایین‌ترین) جایگاه.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num} type="button" onClick={() => setEditForm({...editForm, priority: num})}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${outfitFont.className} ${
                              editForm.priority === num 
                                ? 'bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : 'bg-[#111111] text-zinc-500 border border-white/5 hover:border-white/30 hover:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-bold tracking-wide">توضیحات متنی</label>
                    <textarea 
                      value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required rows={4}
                      className="w-full p-5 bg-[#050505] border border-white/10 rounded-2xl text-white focus:border-white/50 transition-all resize-none leading-loose text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-bold tracking-wide">متن نتیجه‌گیری پایانی (اختیاری)</label>
                    <textarea 
                      value={editForm.bottomText} onChange={(e) => setEditForm({...editForm, bottomText: e.target.value})} rows={2}
                      className="w-full p-5 bg-[#050505] border border-white/10 rounded-2xl text-white focus:border-white/50 transition-all resize-none leading-relaxed text-sm"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 md:p-8 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-end gap-4 shrink-0 relative z-10">
                <button 
                  type="button" onClick={closeEditModal}
                  className="px-6 py-3.5 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button 
                  form="editForm" type="submit" disabled={isSaving || totalCurrentVideos === 0}
                  className="bg-white text-black px-8 py-3.5 rounded-xl font-bold text-base hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'ذخیره تغییرات'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}