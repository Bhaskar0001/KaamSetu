import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Shield, ArrowLeft } from 'lucide-react';

function WalletPage() {
    const { t, language, changeLanguage } = useLanguage();
    const navigate = useNavigate();

    // Dummy Data for Preview (as requested "add some dummy data")
    const [transactions, setTransactions] = useState([
        { id: 1, type: 'credit', amount: 500, title: 'Trip Payment', date: '2024-03-10', status: 'success' },
        { id: 2, type: 'debit', amount: 200, title: 'Withdrawal', date: '2024-03-08', status: 'success' },
        { id: 3, type: 'credit', amount: 1500, title: 'Weekly Bonus', date: '2024-03-05', status: 'success' },
        { id: 4, type: 'debit', amount: 50, title: 'Platform Fee', date: '2024-03-01', status: 'success' },
    ]);

    const [showAddMoney, setShowAddMoney] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [processing, setProcessing] = useState(false);
    const [balance, setBalance] = useState(1850);

    const handlePayment = () => {
        if (!amountToAdd) return;
        setProcessing(true);
        // Simulate Gateway Delay
        setTimeout(() => {
            setProcessing(false);
            setBalance(prev => prev + Number(amountToAdd));
            setTransactions(prev => [
                { id: Date.now(), type: 'credit', amount: Number(amountToAdd), title: 'Wallet Top-up', date: new Date().toISOString().split('T')[0], status: 'success' },
                ...prev
            ]);
            setShowAddMoney(false);
            setAmountToAdd('');
            // toast.success('Payment Successful!'); // Needs import
            alert('✅ Payment Successful! Money Added.'); // Fallback
        }, 2000);
    };

    // Check offline status for UI feedback
    React.useEffect(() => {
        if (!navigator.onLine) {
            // Check if we have cached wallet data (even though this page mostly uses dummy data for now)
            // In a real app, we'd fetch transactions here.
            // But visually, let's remind them.
            // toast.info(t('offline_mode') || "Offline Mode: Showing cached balance");
        }
    }, []);

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 20px 0' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'white', border: 'none', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color='#334155' />
                </button>
                <h2 style={{ margin: 0, color: '#1e293b' }}>{t('wallet')}</h2>
                <button onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')} style={{ background: '#e2e8f0', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Balance Card */}
                <div className="glass-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{t('total_balance')}</p>
                            <h1 style={{ margin: '5px 0', fontSize: '2.5rem' }}>₹{balance.toLocaleString()}</h1>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '12px' }}>
                            <Shield size={24} color="#4ade80" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button className="btn" style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none' }} onClick={() => setShowAddMoney(true)}>
                            <ArrowUpRight size={18} style={{ marginRight: '5px' }} /> {t('add_money')}
                        </button>
                        <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                            <ArrowDownLeft size={18} style={{ marginRight: '5px' }} /> {t('withdraw')}
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '25px' }}>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
                        <CreditCard size={28} color="#0ea5e9" style={{ marginBottom: '10px' }} />
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>UPI ID</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>{t('link_bank')}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
                        <Clock size={28} color="#f59e0b" style={{ marginBottom: '10px' }} />
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{t('history')}</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>{t('view_all')}</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <h3 style={{ marginBottom: '15px' }}>{t('recent_transactions')}</h3>
                <div className="glass-card" style={{ padding: '0' }}>
                    {transactions.map((txn, index) => (
                        <div key={txn.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '15px 20px',
                            borderBottom: index !== transactions.length - 1 ? '1px solid #e2e8f0' : 'none'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: txn.type === 'credit' ? '#dcfce7' : '#fee2e2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginRight: '15px'
                            }}>
                                {txn.type === 'credit' ? <ArrowDownLeft size={20} color="#16a34a" /> : <ArrowUpRight size={20} color="#dc2626" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{txn.title}</h4>
                                <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>{txn.date}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    display: 'block',
                                    fontWeight: 'bold',
                                    color: txn.type === 'credit' ? '#16a34a' : '#dc2626'
                                }}>
                                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                </span>
                                <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{txn.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Money Modal */}
            {showAddMoney && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: '400px', background: 'white', color: '#333' }}>
                        <h3 style={{ marginBottom: '20px' }}>{t('add_money_to_wallet')}</h3>

                        {!processing ? (
                            <>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>{t('enter_amount')}</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={amountToAdd}
                                    onChange={e => setAmountToAdd(e.target.value)}
                                    placeholder="e.g. 500"
                                    style={{ fontSize: '1.5rem', marginBottom: '20px' }}
                                />

                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>{t('select_payment_method')}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                    <button className="btn btn-outline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📱</span> UPI
                                    </button>
                                    <button className="btn btn-outline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>💳</span> Card
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn" style={{ flex: 1, background: '#e2e8f0' }} onClick={() => setShowAddMoney(false)}>{t('cancel')}</button>
                                    <button className="btn btn-success" style={{ flex: 1 }} onClick={handlePayment}>{t('pay')} ₹{amountToAdd || 0}</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                                <h4>{t('processing_payment')}</h4>
                                <p className="text-muted">{t('connecting_gateway')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WalletPage;
