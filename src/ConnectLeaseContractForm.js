import React, { useState } from 'react';
import { Contract } from 'ethers';

const ConnectLeaseContractForm = ({ signer, provider, defaultContractAddress, defaultContractABI }) => {
    // Log the signer for debugging purposes
    console.log("Signer:", signer);

    const [contractAddress, setContractAddress] = useState(defaultContractAddress || '');
    const [leaseContractABI, setLeaseContractABI] = useState(defaultContractABI || '');
    const [view, setView] = useState('');
    const [owner, setOwner] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const validateFields = () => {
        if (!contractAddress.trim()) {
            setErrorMessage('Deployed Contract Address is required.');
            return false;
        }
        if (!leaseContractABI.trim()) {
            setErrorMessage('Deployed Contract ABI (JSON) is required.');
            return false;
        }
        return true;
    };

    const connectToDeployedContract = async () => {
        if (!validateFields()) return;

        setView('connecting');
        setErrorMessage('');

        try {
            const contract = new Contract(contractAddress, JSON.parse(leaseContractABI), signer);

            const bytecode = await provider.getCode(contractAddress);
            if (bytecode === '0x') {
                throw new Error('Contract not found at the provided address.');
            }

            const contractOwner = await contract.displayContractOwner(); // Access "owner" method from contract
            setOwner(contractOwner);
            setView('connected');
        } catch (error) {
            console.error('Error connecting to contract:', error);
            setErrorMessage(`Error connecting to contract: ${error.message}`);
            setView('error');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h2 style={styles.title}>Connect to Contract</h2>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Deployed Contract Address:</label>
                    <input
                        type="text"
                        style={styles.input}
                        placeholder="Enter deployed contract address"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Contract ABI (JSON):</label>
                    <textarea
                        style={styles.textarea}
                        placeholder="Enter Contract ABI in JSON format"
                        rows="7"
                        value={leaseContractABI}
                        onChange={(e) => setLeaseContractABI(e.target.value)}
                    />
                </div>

                <div style={styles.buttonWrapper}>
                    <button
                        style={styles.button}
                        disabled={view === 'connecting'}
                        onClick={connectToDeployedContract}
                    >
                        {view === 'connecting' ? 'Connecting...' : 'Connect'}
                    </button>
                </div>

                {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
            </div>

            {view === 'connected' && (
                <div style={styles.resultSection}>
                    <h3 style={styles.successMessage}>Successfully connected to the contract!</h3>
                    <p style={styles.ownerText}>Contract Owner: {owner}</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        margin: '20px auto',
        maxWidth: '500px',
    },
    form: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        fontSize: '1rem',
        color: '#555',
        marginBottom: '5px',
        display: 'inline-block',
        textAlign: 'left',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        border: '1px solid #ccc',
        borderRadius: '5px',
        resize: 'vertical',
    },
    buttonWrapper: {
        marginTop: '15px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
    },
    errorMessage: {
        color: 'red',
        fontSize: '0.875rem',
        marginTop: '10px',
    },
    resultSection: {
        marginTop: '20px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
    },
    successMessage: {
        color: '#28A745',
        fontSize: '1rem',
        marginBottom: '8px',
    },
    ownerText: {
        color: '#555',
        fontSize: '1rem',
        marginTop: '10px',
    },
};

export default ConnectLeaseContractForm;