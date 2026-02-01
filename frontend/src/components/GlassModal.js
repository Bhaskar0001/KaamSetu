import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const GlassModal = ({ isOpen, onClose, title, children, type = 'default' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        if (type === 'success') return <CheckCircle color="#22c55e" size={24} />;
        if (type === 'error') return <AlertCircle color="#ef4444" size={24} />;
        return null;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
                        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-card"
                        style={{
                            width: '100%', maxWidth: '400px', background: 'white',
                            padding: '0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                    >
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {getIcon()}
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{title}</h3>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlassModal;
