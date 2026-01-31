import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Skeleton from '../components/Skeleton';

function ContractPage() {
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
                toast.error('Failed to load contract');
                navigate('/owner');
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [id, navigate]);

    if (loading) return <div className="container"><Skeleton height="400px" /></div>;
    if (!contract) return null;

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <section className="heading">
                <h1>📜 Digital Work Contract</h1>
                <p>Agreement between {contract.owner.name} and {contract.worker.name}</p>
            </section>

            <div className="contract-card" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <p><strong>Job:</strong> {contract.job.title}</p>
                    <p><strong>Amount:</strong> ₹{contract.amount}</p>
                    <p><strong>Status:</strong> <span className="badge badge-success">{contract.status}</span></p>
                    <p><strong>Date:</strong> {new Date(contract.createdAt).toLocaleDateString()}</p>
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
                    ⬇️ Download PDF
                </button>
            </div>
        </div>
    );
}

export default ContractPage;
