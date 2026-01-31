import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';

function WalletPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addFundsAmount, setAddFundsAmount] = useState('');
    const [isAddingFunds, setIsAddingFunds] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get('http://localhost:5000/api/payments/wallet', config);
            setWallet(res.data.data.wallet);
            setTransactions(res.data.data.transactions || []);
        } catch (err) {
            setError('Failed to load wallet');
            toast.error('Could not load wallet details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!addFundsAmount || Number(addFundsAmount) <= 0) {
            toast.warning('Please enter a valid amount');
            return;
        }

        setIsAddingFunds(true);
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post('http://localhost:5000/api/payments/add-funds',
                { amount: Number(addFundsAmount) },
                config
            );
            toast.success('✅ Funds added successfully!');
            setAddFundsAmount('');
            fetchWallet();
        } catch (err) {
            toast.error(err.response?.data?.message || '❌ Failed to add funds');
        } finally {
            setIsAddingFunds(false);
        }
    };

    if (loading) {
        return (
            <div className='container'>
                <section className='heading'>
                    <Skeleton height="40px" width="50%" style={{ margin: '0 auto' }} />
                </section>
                <Skeleton height="150px" style={{ marginBottom: '20px' }} />
                <Skeleton height="100px" />
            </div>
        );
    }

    return (
        <div className='container'>
            <section className='heading'>
                <h1>💰 My Wallet</h1>
                <p>Manage your funds securely</p>
            </section>

            {error && <div className='error-box'>{error}</div>}

            {/* Balance Card */}
            <div className='wallet-balance'>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Available Balance</p>
                <h2>₹{wallet?.balance?.toLocaleString() || 0}</h2>
            </div>

            {/* Add Funds Form */}
            <div className='card'>
                <h3>➕ Add Funds</h3>
                <form onSubmit={handleAddFunds} className='flex gap-md'>
                    <input
                        type='number'
                        className='form-control'
                        placeholder='Enter amount'
                        value={addFundsAmount}
                        onChange={(e) => setAddFundsAmount(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type='submit' className='btn btn-success' disabled={isAddingFunds}>
                        {isAddingFunds ? 'Adding...' : '💳 Add'}
                    </button>
                </form>
            </div>

            {/* Quick Add Buttons */}
            <div className='flex gap-md mb-md' style={{ flexWrap: 'wrap' }}>
                {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                        key={amt}
                        className='btn btn-outline'
                        onClick={() => setAddFundsAmount(amt.toString())}
                    >
                        +₹{amt}
                    </button>
                ))}
            </div>

            {/* Transaction History */}
            <div className='card'>
                <h3>📜 Transaction History</h3>
                {transactions.length === 0 ? (
                    <p className='text-muted'>No transactions yet</p>
                ) : (
                    <div>
                        {transactions.map((txn) => (
                            <div
                                key={txn._id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #e2e8f0'
                                }}
                            >
                                <div>
                                    <strong>{txn.description || txn.type}</strong>
                                    <br />
                                    <small className='text-muted'>
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: txn.type === 'credit' ? '#16a34a' : '#dc2626'
                                }}>
                                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WalletPage;
