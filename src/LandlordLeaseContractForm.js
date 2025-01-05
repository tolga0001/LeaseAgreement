import React, {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import pdfToText from 'react-pdftotext';
import { useLocation } from 'react-router-dom';

const LandlordLeaseContractForm = ({landlordAddress,connectedContract,}) => {
    const [tenantName, setTenantName] = useState('');
    const [tenantAddress, setTenantAddress] = useState('');
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
    const [deploymentState, setDeploymentState] = useState({isDeployed: false, isCreating: false});
    const [deployedAddress, setDeployedAddress] = useState(null);
    const [agreementSigned, setAgreementSigned] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]); // Existing state for additional files
    const location = useLocation();

    console.log(connectedContract)
    console.log("Landlord address: ", landlordAddress)


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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text}),
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
    const handleAddLandlord = async () => {
        try {
            const tx = await connectedContract.addLandLord();
            console.log('Add Landlord Transaction Submitted:', tx.hash);
            await tx.wait(); // Wait for the transaction to be confirmed
            console.log('Landlord successfully added');
        } catch (error) {
            setError('Failed to add landlord. Please try again.');
            console.error(error);
        }
    };


    const handleAgreement = async () => {
        if (!tenantName || !landlordName || !propertyAddress || !leaseDuration || !monthlyRent || !startDate || !endDate || !securityDeposit || !agreementSigned) {
            setError('Please complete all fields and agree to the terms before creating the agreement.');
            return;
        }
        setError('');
        await handleAddLandlord();
        //await handleAddTenant();

        const formattedMonthlyRent = parseFloat(monthlyRent.replace(/[^\d.-]/g, '')); // Remove non-numeric characters (e.g., "TL")
        const tx = await connectedContract.createRentalAgreement(
            tenantAddress,
            landlordName,
            tenantName,
            propertyAddress,
            parseInt(annualRentIncrease), // Ensure rate is integer
            ethers.utils.parseUnits(formattedMonthlyRent.toString(), 0) // Treat as Wei directly
        );

        console.log('Transaction submitted:', tx.hash);

        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log('Transaction confirmed:', tx);
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
                            <label style={styles.label}>Tenant Address:</label>
                            <input
                                type="text"
                                value={tenantAddress}
                                onChange={(e) => setTenantAddress(e.target.value)}
                                style={styles.input}
                                placeholder="Enter tenant's Ethereum address"
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
                            onClick={handleAgreement}
                            disabled={deploymentState.isCreating}
                            style={{
                                ...styles.button,
                                ...(deploymentState.isCreating ? styles.buttonDisabled : {}),
                            }}
                        >
                            {deploymentState.isCreating ? 'Creating...' : 'Create Agreement'}
                        </button>
                    </>
                ) : (
                    <div style={styles.successContainer}>
                        <h2>Agreement Created Successfully</h2>
                    </div>
                )}
            </div>
        </div>
    )
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

export default LandlordLeaseContractForm;
