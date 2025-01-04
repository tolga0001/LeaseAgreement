import React, { useState } from 'react';
import { ethers } from 'ethers';

const DeployContract = ({ signer }) => {
    const [abi, setAbi] = useState('');
    const [bytecode, setBytecode] = useState('');
    const [status, setStatus] = useState(null); // Tracks the deployment state
    const [deployedAddress, setDeployedAddress] = useState(null); // Stores deployed contract address
    const [error, setError] = useState(null); // Error messages during deployment

    const handleDeploy = async () => {
        // Reset states before deployment
        setStatus('loading');
        setError('');
        setDeployedAddress('');

        try {
            // Parse ABI and create contract factory
            const parsedAbi = JSON.parse(abi); // The ABI must be valid JSON
            const contractFactory = new ethers.ContractFactory(parsedAbi, bytecode, signer);

            // Deploy the contract
            const deployedContract = await contractFactory.deploy();
            await deployedContract.deployed(); // Wait until the contract is deployed on chain

            // Update deployed address and status
            setDeployedAddress(deployedContract.address);
            setStatus('success');
        } catch (err) {
            console.error('Contract deployment error:', err);
            setError('Failed to deploy the contract. Please check ABI and Bytecode.');
            setStatus('error');
        }
    };

    return (
        <div style={styles.container}>
            <h1>Deploy Contract</h1>
            <p>Enter your contract ABI and Bytecode to deploy a new smart contract.</p>

            {/* Input for ABI */}
            <textarea
                style={styles.textarea}
                rows="8"
                placeholder="Enter contract ABI (JSON format)"
                value={abi}
                onChange={(e) => setAbi(e.target.value)}
            ></textarea>

            {/* Input for Bytecode */}
            <textarea
                style={styles.textarea}
                rows="4"
                placeholder="Enter contract Bytecode"
                value={bytecode}
                onChange={(e) => setBytecode(e.target.value)}
            ></textarea>

            {/* Status Indicators */}
            {status === 'loading' && <p style={styles.loading}>Deploying the contract. Please wait...</p>}
            {status === 'error' && <p style={styles.error}>{error}</p>}
            {status === 'success' && (
                <div style={styles.success}>
                    <h3>Contract deployed successfully!</h3>
                    <p>
                        Contract Address: <strong>{deployedAddress}</strong>
                    </p>
                </div>
            )}

            {/* Deploy Button */}
            {(status === null || status === 'error') && (
                <button onClick={handleDeploy} style={styles.button}>
                    Deploy Contract
                </button>
            )}
        </div>
    );
};

// Styles for the component
const styles = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f4f4f4',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '14px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: 'white',
        fontSize: '16px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    error: {
        color: 'red',
        fontSize: '14px',
        marginTop: '10px',
    },
    loading: {
        color: 'blue',
        fontSize: '16px',
        marginTop: '10px',
        fontWeight: 'bold',
    },
    success: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#E6FFE6',
        border: '1px solid #28A745',
        borderRadius: '5px',
        color: '#28A745',
    },
};

export default DeployContract;