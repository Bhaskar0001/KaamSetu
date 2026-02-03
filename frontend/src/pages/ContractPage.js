import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';

function ContractPage() {
    const { t, language, changeLanguage } = useLanguage();
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const res = await api.get(`/contracts/${id}`);
                setContract(res.data.data);
            } catch (err) {
                toast.error(t('failed_to_load_contract'));
                navigate('/owner');
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [id, navigate, t]);

    if (loading) return <div className="container"><Skeleton height="400px" /></div>;
    if (!contract) return null;

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px' }}>
                <button onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')} style={{ background: '#e2e8f0', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
            </div>
            <section className="heading">
                <h1>{t('digital_work_contract')}</h1>
                <p>{t('agreement_between')} {contract.owner.name} {t('and')} {contract.worker.name}</p>
            </section>

            <div className="contract-card" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <p><strong>{t('job')}:</strong> {contract.job.title}</p>
                    <p><strong>{t('amount')}:</strong> ₹{contract.amount}</p>
                    <p><strong>{t('status')}:</strong> <span className="badge badge-success">{contract.status}</span></p>
                    <p><strong>{t('date')}:</strong> {new Date(contract.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}</p>
                </div>

                {/* PDF Viewer */}
                <div style={{ border: '1px solid #ddd', height: '500px', marginBottom: '20px' }}>
                    <iframe
                        src={`http://localhost:5000/${contract.pdfPath}`}
                        width="100%"
                        height="100%"
                        title="Contract PDF"
                    />
                </div>

                <button className="btn btn-primary" onClick={() => window.open(`http://localhost:5000/${contract.pdfPath}`, '_blank')}>
                    {t('download_pdf')}
                </button>
            </div>
        </div>
    );
}

export default ContractPage;
