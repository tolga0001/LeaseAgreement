import React, { useState } from 'react';
import { ethers } from 'ethers';
import pdfToText from 'react-pdftotext';

const DeployLeaseContractForm = ({ signer, setContract }) => {
    const [tenantName, setTenantName] = useState('');
    const [landlordName, setLandlordName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [leaseDuration, setLeaseDuration] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [annualRentIncrease, setAnnualRentIncrease] = useState(''); // Added field
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [additionalTerms, setAdditionalTerms] = useState(''); // Existing field
    const [contactInfo, setContactInfo] = useState(''); // Existing field
    const [error, setError] = useState('');
    const [deploymentState, setDeploymentState] = useState({ isDeployed: false, isDeploying: false });
    const [deployedAddress, setDeployedAddress] = useState(null);
    const [agreementSigned, setAgreementSigned] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]); // Existing state for additional files

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            try {
                const text = await extractText(file);
                await processTextWithBackend(text);
            } catch (error) {
                setError('Failed to read PDF. Please upload a valid lease agreement.');
            }
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleAdditionalFileChange = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const extractText = async (file) => {
        try {
            return await pdfToText(file);
        } catch (error) {
            throw new Error('Failed to extract text from PDF.');
        }
    };

    const formatDateString = (dateString) => {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month}-${day}`;
    };

    const processTextWithBackend = async (text) => {
        try {
            const response = await fetch('http://localhost:5000/api/gpt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Backend error: Failed to fetch data.');
            }

            const data = await response.json();

            setTenantName(data.tenantName || '');
            setLandlordName(data.landlordName || '');
            setPropertyAddress(data.propertyAddress || '');
            setLeaseDuration(data.leaseDuration || '');
            setMonthlyRent(data.monthlyRent || '');
            setStartDate(data.startDate ? formatDateString(data.startDate) : '');
            setEndDate(data.endDate ? formatDateString(data.endDate) : '');
            setAnnualRentIncrease(data.annualRentIncrease || ''); // Updated field
            setSecurityDeposit(data.securityDeposit || '');
            setAdditionalTerms(data.additionalTerms || '');
            setContactInfo(data.contactInfo || '');
        } catch (error) {
            setError('Failed to process the lease agreement.');
        }
    };

    const handleDeploy = async () => {
        if (!tenantName || !landlordName || !propertyAddress || !leaseDuration || !monthlyRent || !startDate || !endDate || !securityDeposit || !agreementSigned) {
            setError('Please complete all fields and agree to the terms before deploying the contract.');
            return;
        }
        setError('');

    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Lease Agreement Deployment</h1>
            <div style={styles.formContainer}>
                {!deploymentState.isDeployed ? (
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
                            <label style={styles.label}>Lease Duration:</label>
                            <input
                                type="text"
                                value={leaseDuration}
                                onChange={(e) => setLeaseDuration(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Monthly Rent:</label>
                            <input
                                type="text"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Annual Rent Increase (%):</label>
                            <input
                                type="number"
                                value={annualRentIncrease}
                                onChange={(e) => setAnnualRentIncrease(e.target.value)}
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
                            <label style={styles.label}>Security Deposit:</label>
                            <input
                                type="text"
                                value={securityDeposit}
                                onChange={(e) => setSecurityDeposit(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Additional Terms:</label>
                            <textarea
                                value={additionalTerms}
                                onChange={(e) => setAdditionalTerms(e.target.value)}
                                style={styles.textarea}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Contact Info:</label>
                            <input
                                type="text"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                style={styles.input}
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
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Upload Additional Files:</label>
                            <input
                                type="file"
                                multiple
                                onChange={handleAdditionalFileChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreementSigned}
                                    onChange={(e) => setAgreementSigned(e.target.checked)}
                                />
                                I agree to the terms and conditions.
                            </label>
                        </div>
                        {error && <p style={styles.error}>{error}</p>}
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
