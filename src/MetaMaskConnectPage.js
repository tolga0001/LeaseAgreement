import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MetaMaskConnectionPage() {
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const navigate = useNavigate();

    const connectMetaMask = async () => {
        try {
            setIsConnecting(true);
            const provider = window.ethereum;

            if (!provider) {
                throw new Error('MetaMask is not installed. Please install it to continue.');
            }

            const accounts = await provider.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please add your account in MetaMask.');
            }

            setError(null);
            setIsConnecting(false);
            return true;
        } catch (err) {
            setError(err.message);
            setIsConnecting(false);
            return false;
        }
    };

    const handleButtonClick = async () => {
        const isConnected = await connectMetaMask();
        if (isConnected) {
            navigate('/home');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.header}>Lease Agreement Contract</h1>
                <p style={styles.subtitle}>
                    Connect your MetaMask wallet to access the lease agreement functionality.
                </p>

                <div style={styles.section}>
                    <button
                        onClick={handleButtonClick}
                        style={{
                            ...styles.button,
                            ...(isConnecting ? styles.buttonDisabled : {}),
                        }}
                        disabled={isConnecting}
                        aria-label="Connect to MetaMask wallet"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                    </button>

                    {error && <p style={styles.error}>{error}</p>}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6, #e4e7eb)', // Subtle gradient background
    },
    card: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Subtle shadow for "floating" effect
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%', // Responsive sizing
    },
    header: {
        fontSize: '1.8rem',
        marginBottom: '10px',
        color: '#333',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#555',
        marginBottom: '20px',
        lineHeight: '1.6',
    },
    section: {
        marginTop: '20px',
    },
    button: {
        backgroundColor: '#0092D1',
        color: 'white',
        padding: '12px 32px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.3s, transform 0.2s',
    },
    buttonDisabled: {
        backgroundColor: '#66b2dd',
        cursor: 'not-allowed',
    },
    error: {
        color: 'red',
        marginTop: '15px',
        fontWeight: 'bold',
    },
};

export default MetaMaskConnectionPage;