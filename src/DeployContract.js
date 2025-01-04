import React, { useState } from 'react';
import { ethers } from 'ethers';
import lotteryContractABI from './lotteryContractABI.json';

const DeployContract = ({ signer }) => {
    const [status, setStatus] = useState(null); // Success or loading state
    const [deployedAddress, setDeployedAddress] = useState(null); // Contract address on success
    const [error, setError] = useState(null); // Error state

    const handleDeploy = async () => {
        // Reset states
        setStatus('loading');
        setError(null);

        try {
            // Initialize Contract Factory
            const leaseContractFactory = new ethers.ContractFactory(
                lotteryContractABI,
                "YOUR_CONTRACT_BYTECODE", // Replace with real contract bytecode
                signer
            );

            // Deploy the contract without any parameter
            const leaseContract = await leaseContractFactory.deploy();

            // Wait for the deployment to be finished
            await leaseContract.deployed();
            setDeployedAddress(leaseContract.address); // Store deployed address
            setStatus('success');
        } catch (error) {
            console.error('Error deploying contract:', error);
            setError('Failed to deploy contract. Please try again.');
            setStatus('error');
        }
    };

    return (
        <div style={styles.container}>
            <h1>Deploy Your Contract</h1>
            {status === 'success' && (
                <div style={styles.successBox}>
                    <h3>Contract deployed successfully!</h3>
                    <p>Contract Address: <strong>{deployedAddress}</strong></p>
                </div>
            )}
            {status === 'loading' && <p style={styles.loading}>Deploying your contract...</p>}
            {error && <p style={styles.error}>{error}</p>}
            {!status || status === 'error' ? (
                <button onClick={handleDeploy} style={styles.button}>
                    Deploy Contract
                </button>
            ) : null}
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        maxWidth: '500px',
        margin: 'auto',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: '#FFF',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginTop: '10px',
    },
    loading: {
        color: 'blue',
        fontWeight: 'bold',
        marginTop: '10px',
    },
    successBox: {
        margin: '20px auto',
        padding: '15px',
        backgroundColor: '#e7f5e7',
        border: '1px solid #4CAF50',
        borderRadius: '5px',
        color: '#4CAF50',
    },
};

export default DeployContract;