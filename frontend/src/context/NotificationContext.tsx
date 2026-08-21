"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const NotificationContext = createContext({
  notify: () => {},
  confirm: async () => false,
});

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const notify = useCallback((type, title, message) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmModal({
        id: Date.now().toString(),
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'بله، انجام بده',
        cancelText: options.cancelText || 'انصراف',
        type: options.type || 'warning',
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmModal) {
      confirmModal.resolve(true);
      setConfirmModal(null);
    }
  };

  const handleCancel = () => {
    if (confirmModal) {
      confirmModal.resolve(false);
      setConfirmModal(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}

      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-4 left-4 z-[9999] max-w-sm w-full"
            style={{ fontFamily: persianFontFamily }}
            dir="rtl"
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 ${
              notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30' :
              notification.type === 'error' ? 'bg-red-950/80 border-red-500/30' :
              notification.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30' :
              'bg-zinc-900/80 border-white/20'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
                notification.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                'bg-white/10 text-white'
              }`}>
                {notification.type === 'success' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ) : notification.type === 'error' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                ) : notification.type === 'warning' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                )}
              </div>

              <div className="flex-1">
                <h4 className={`font-bold text-sm mb-1 ${
                  notification.type === 'success' ? 'text-emerald-400' :
                  notification.type === 'error' ? 'text-red-400' :
                  notification.type === 'warning' ? 'text-amber-400' :
                  'text-white'
                }`}>
                  {notification.title}
                </h4>
                <p className="text-zinc-300 text-xs leading-relaxed">{notification.message}</p>
              </div>

              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={handleCancel}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-2xl"
              style={{ fontFamily: persianFontFamily }}
              dir="rtl"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                confirmModal.type === 'danger' ? 'bg-red-500/10 text-red-400' :
                confirmModal.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {confirmModal.type === 'danger' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                ) : confirmModal.type === 'warning' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                )}
              </div>

              <h3 className="text-white font-bold text-xl text-center mb-3">
                {confirmModal.title}
              </h3>
              <p className="text-zinc-400 text-sm text-center leading-relaxed mb-8">
                {confirmModal.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    confirmModal.type === 'danger' 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : confirmModal.type === 'warning'
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#050505] text-zinc-400 border border-white/10 hover:text-white hover:border-white/30 transition-all"
                >
                  {confirmModal.cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}