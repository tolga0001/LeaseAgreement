import React, { useState } from 'react';
import { ethers } from 'ethers';


const DeployLeaseContractForm = ({ signer, setContract }) => {
    const [tenantName, setTenantName] = useState('');
    const [landlordName, setLandlordName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [leaseDuration, setLeaseDuration] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [annualRentIncrease, setAnnualRentIncrease] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [agreementSigned, setAgreementSigned] = useState(false);
    const [error, setError] = useState('');
    const [deploymentState, setDeploymentState] = useState({ isDeployed: false, isDeploying: false });
    const [deployedAddress, setDeployedAddress] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setError(''); // Clear error if a valid file is uploaded
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleDeploy = async () => {
        if (deploymentState.isDeployed) {
            alert(`The contract has already been deployed to: ${deployedAddress}`);
            return;
        }

        if (!tenantName || !landlordName || !propertyAddress || !leaseDuration || !monthlyRent || !startDate || !endDate || !securityDeposit) {
            setError('Please complete all fields before deploying the contract.');
            return;
        }

        if (!agreementSigned) {
            setError('You must agree to the terms to deploy the contract.');
            return;
        }

        if (!pdfFile) {
            setError('Please upload the lease agreement PDF.');
            return;
        }

        setError('');
        //setDeploymentState({ ...deploymentState, isDeploying: true });

    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Lease Agreement Deployment For Landlord</h1>

            <div style={styles.formContainer}>
                {!deploymentState.isDeployed ? (
                    <>
                        <div style={styles.inputGroup}>
                            <label htmlFor="tenantName" style={styles.label}>Tenant Name:</label>
                            <input
                                id="tenantName"
                                type="text"
                                aria-label="Tenant Name"
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="landlordName" style={styles.label}>Landlord Name:</label>
                            <input
                                id="landlordName"
                                type="text"
                                aria-label="Landlord Name"
                                value={landlordName}
                                onChange={(e) => setLandlordName(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="propertyAddress" style={styles.label}>Property Address:</label>
                            <input
                                id="propertyAddress"
                                type="text"
                                aria-label="Property Address"
                                value={propertyAddress}
                                onChange={(e) => setPropertyAddress(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="annualRentIncrease" style={styles.label}>Yearly Rent Increase (%):</label>
                            <input
                                id="annualRentIncrease"
                                type="number"
                                aria-label="Annual Rent Increase"
                                value={annualRentIncrease}
                                onChange={(e) => setAnnualRentIncrease(e.target.value)}
                                placeholder="e.g., 10"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="leaseDuration" style={styles.label}>Lease Duration (months):</label>
                            <input
                                id="leaseDuration"
                                type="number"
                                aria-label="Lease Duration"
                                value={leaseDuration}
                                onChange={(e) => setLeaseDuration(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="monthlyRent" style={styles.label}>Monthly Rent ($):</label>
                            <input
                                id="monthlyRent"
                                type="number"
                                aria-label="Monthly Rent"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Upload Lease Agreement (PDF):</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                aria-label="Lease Agreement Upload"
                                onChange={handleFileChange}
                                style={styles.input}
                            />
                            {pdfFile && <p style={styles.fileInfo}>Selected file: {pdfFile.name}</p>}
                        </div>

                        {error && (
                            <div style={styles.errorContainer}>
                                <p style={styles.errorMessage}>{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleDeploy}
                            disabled={deploymentState.isDeploying}
                            style={{
                                ...styles.button,
                                ...(deploymentState.isDeploying ? styles.buttonDisabled : {}),
                            }}
                        >
                            {deploymentState.isDeploying ? 'Deploying...' : 'Deploy Contract'}
                        </button>
                    </>
                ) : (
                    <div style={styles.successContainer}>
                        <h2>Contract Deployed Successfully</h2>
                        <p>Contract Address: {deployedAddress}</p>
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
        padding: '16px',
        backgroundColor: '#f4f4f4',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: '2rem',
        color: '#222',
        marginBottom: '20px',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '24px',
        width: '95%', // Allows for a bit more space on smaller screens
        maxWidth: '540px', // Increased maximum width
        borderRadius: '8px',
        boxShadow: '0 7px 20px rgba(0, 0, 0, 0.15)',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '8px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '12px', // Increased padding for improved visuals
        fontSize: '1rem',
        borderRadius: '6px',
        border: '1px solid #bbb',
        boxSizing: 'border-box', // Ensures no overflow due to padding or borders
    },
    button: {
        width: '100%',
        padding: '14px', // Bigger button for better interaction
        fontSize: '1.1rem',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    buttonDisabled: {
        backgroundColor: '#aaa',
        cursor: 'not-allowed',
    },
    successContainer: {
        textAlign: 'center',
    },
    errorContainer: {
        padding: '12px', // Increased padding for better spacing
        backgroundColor: '#fdecea',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    errorMessage: {
        color: '#d32f2f',
        fontSize: '0.9rem',
    },
    fileInfo: {
        fontSize: '0.9rem',
        color: '#444',
    },
};

export default DeployLeaseContractForm;