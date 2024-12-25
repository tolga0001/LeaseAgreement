import React, { useState } from 'react';
import { ethers } from 'ethers';
import lotteryContractABI from './lotteryContractABI.json';

const DeployLeaseContractForm = ({ signer, contract, setContract }) => {
    const [tenantName, setTenantName] = useState('');
    const [landlordName, setLandlordName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [leaseDuration, setLeaseDuration] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [agreementSigned, setAgreementSigned] = useState(false);
    const [error, setError] = useState('');
    const [isDeployed, setIsDeployed] = useState(false);
    const [, setButtonText] = useState('Deploy');
    const [deployedAddress, setDeployedAddress] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleDeploy = async () => {
        if (!signer) {
            alert('Please connect MetaMask first.');
            return;
        }

        if (isDeployed) {
            alert(`The contract is already deployed at address: ${contract.address}`);
            return;
        }

        if (!tenantName || !landlordName || !propertyAddress || !leaseDuration || !monthlyRent || !startDate || !endDate || !securityDeposit) {
            setError('Please fill in all fields.');
            return;
        }

        if (!agreementSigned) {
            setError('Please sign the agreement.');
            return;
        }

        if (!pdfFile) {
            setError('Please upload the lease agreement PDF.');
            return;
        }

        setError('');
        setButtonText('Deploying...');

        try {
            const leaseContractFactory = new ethers.ContractFactory(
                lotteryContractABI,
                "YOUR_CONTRACT_BYTECODE", // Replace with actual contract bytecode
                signer
            );

            const leaseContract = await leaseContractFactory.deploy(
                tenantName,
                landlordName,
                propertyAddress,
                leaseDuration,
                monthlyRent,
                startDate,
                endDate,
                securityDeposit
            );

            await leaseContract.deployed();
            setDeployedAddress(leaseContract.address);
            setContract(leaseContract);
            setIsDeployed(true);
            setButtonText('Contract Deployed');
            alert('Contract deployed successfully!');
        } catch (error) {
            console.error(error);
            setError('Failed to deploy contract.');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Lease Agreement</h1>
            <div style={styles.formContainer}>
                {!isDeployed ? (
                    <>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Tenant Name:</label>
                            <input
                                type="text"
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Landlord Name:</label>
                            <input
                                type="text"
                                value={landlordName}
                                onChange={(e) => setLandlordName(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Property Address:</label>
                            <input
                                type="text"
                                value={propertyAddress}
                                onChange={(e) => setPropertyAddress(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Lease Duration (months):</label>
                            <input
                                type="number"
                                value={leaseDuration}
                                onChange={(e) => setLeaseDuration(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Monthly Rent ($):</label>
                            <input
                                type="number"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Start Date:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>End Date:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Security Deposit ($):</label>
                            <input
                                type="number"
                                value={securityDeposit}
                                onChange={(e) => setSecurityDeposit(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>I Agree to the Terms:</label>
                            <input
                                type="checkbox"
                                checked={agreementSigned}
                                onChange={(e) => setAgreementSigned(e.target.checked)}
                                style={styles.checkbox}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Upload Lease Agreement (PDF):</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                style={styles.input}
                            />
                            {pdfFile && <p>Selected file: {pdfFile.name}</p>}
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        <button
                            onClick={handleDeploy}
                            disabled={isDeployed}
                            style={{
                                ...styles.button,
                                ...(isDeployed ? styles.buttonDisabled : {}),
                            }}
                        >
                            {isDeployed ? 'Deploying...' : 'Deploy Lease Agreement'}
                        </button>
                    </>
                ) : (
                    <div style={styles.successMessage}>
                        <h2>Contract Deployed Successfully!</h2>
                        <p>Contract deployed at: {deployedAddress}</p>
                        <button
                            onClick={() => window.history.back()}
                            style={styles.button}
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f7f7f7',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '20px',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        fontSize: '1rem',
        color: '#555',
        marginBottom: '5px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '8px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    },
    checkbox: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        outline: 'none',
        cursor: 'pointer',
        accentColor: '#0092D1',
        marginLeft: '10px',
        transition: 'all 0.3s ease',
    },
    button: {
        backgroundColor: '#1abc9c',
        color: 'white',
        padding: '12px 30px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.3s ease',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    error: {
        color: 'red',
        marginBottom: '15px',
    },
    successMessage: {
        textAlign: 'center',
    },
};

export default DeployLeaseContractForm;