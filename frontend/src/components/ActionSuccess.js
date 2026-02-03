import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShieldCheck } from 'lucide-react';

// Props: isOpen (bool), message (string),subMessage (string), onClose (fn)
function ActionSuccess({ isOpen, message, subMessage, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    style={{
                        width: '120px', height: '120px', background: '#22c55e',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', marginBottom: '30px',
                        boxShadow: '0 0 50px #22c55e'
                    }}
                >
                    <CheckCircle size={80} color="white" strokeWidth={3} />
                </motion.div>

                <h2 style={{ color: 'white', fontSize: '2rem', textAlign: 'center', margin: '0 20px 10px' }}>
                    {message}
                </h2>

                {subMessage && (
                    <p style={{ color: '#ecfdf5', fontSize: '1.2rem', textAlign: 'center', opacity: 0.9 }}>
                        {subMessage}
                    </p>
                )}

                <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                    <ShieldCheck size={18} />
                    <span style={{ fontSize: '0.9rem' }}>Secure & Verified (सुरक्षित)</span>
                </div>

            </motion.div>
        </AnimatePresence>
    );
}

export default ActionSuccess;
