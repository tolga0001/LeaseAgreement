import React, { useState } from 'react';
import { Contract, utils } from 'ethers';

const ConnectLeaseContractForm = ({ signer, provider, defaultContractAddress, defaultContractABI }) => {
    const [contractAddress, setContractAddress] = useState(defaultContractAddress || '');
    const [lotteryContractABI, setLotteryContractABI] = useState(defaultContractABI || '');
    const [randomNumberHash, setRandomNumberHash] = useState('');
    const [view, setView] = useState('');
    const [owner, setOwner] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Validate input fields
    const validateFields = () => {
        if (!contractAddress) {
            setErrorMessage('Contract Address is required.');
            return false;
        }
        if (!lotteryContractABI) {
            setErrorMessage('Contract ABI is required.');
            return false;
        }
        return true;
    };

    const connectToDeployedContract = async () => {
        if (!validateFields()) {
            return; // Stop if validation fails
        }

        setView('connecting');
        setErrorMessage(''); // Clear previous errors

        try {
            const contract = new Contract(contractAddress, JSON.parse(lotteryContractABI), signer);

            // Check if the contract exists at the given address
            const bytecode = await provider.getCode(contractAddress);
            if (bytecode === '0x') {
                throw new Error('Contract not found at the provided address.');
            }

            console.log('Successfully connected to the contract.');

            // Fetch and display the contract owner
            const owner = await contract.displayContractOwner();
            console.log('Contract Owner Address:', owner);
            setOwner(owner);

            setView('connected');
        } catch (error) {
            console.error('Error connecting to contract:', error);
            setView('error');
            setErrorMessage('Error connecting to contract: ' + error.message);
        }
    };

    const purchaseTicket = async () => {
        if (!randomNumberHash) {
            setErrorMessage('Random Number Hash is required.');
            return;
        }

        setErrorMessage(''); // Clear previous errors

        try {
            const contract = new Contract(contractAddress, JSON.parse(lotteryContractABI), signer);
            const randomHashBytes32 = utils.formatBytes32String(randomNumberHash);

            // Fetch the ticket price
            const ticketPriceWei = await contract.ticketPrice();

            // Purchase the ticket
            const tx = await contract.purchaseTicket(randomHashBytes32, {
                value: ticketPriceWei,
            });

            const receipt = await tx.wait();

            console.log(`Transaction successful. Gas used: ${receipt.gasUsed.toString()}`);
        } catch (error) {
            console.error('Error purchasing ticket:', error);
            setErrorMessage('Error purchasing ticket: ' + error.message);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.form}>
                <h2 style={styles.subHeader}>Connect to Contract</h2>

                {/* Contract Address Input */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Contract Address:</label>
                    <input
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        style={styles.input}
                        placeholder="Enter contract address"
                    />
                </div>

                {/* Contract ABI Input */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Contract ABI:</label>
                    <input
                        type="text"
                        value={lotteryContractABI}
                        onChange={(e) => setLotteryContractABI(e.target.value)}
                        style={styles.input}
                        placeholder="Enter contract ABI as a JSON string"
                    />
                </div>

                {/* Connect Button */}
                <div style={styles.buttonWrapper}>
                    <button onClick={connectToDeployedContract} style={styles.button}>
                        {view === 'connecting' ? 'Connecting...' : 'Connect'}
                    </button>
                </div>

                {/* Error Message */}
                <div style={styles.errorWrapper}>
                    {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
                </div>
            </div>

            {view === 'connected' && (
                <div style={styles.form}>
                    <p>Successfully connected to the contract!</p>

                    {/* Random Number Hash Input */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Enter Your Random Number Hash (32-byte string):</label>
                        <input
                            type="text"
                            value={randomNumberHash}
                            onChange={(e) => setRandomNumberHash(e.target.value)}
                            style={styles.input}
                            placeholder="Enter hash"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.buttonWrapper}>
                        <button onClick={purchaseTicket} style={styles.button}>
                            Purchase Ticket
                        </button>
                        <button
                            onClick={() => setOwner(owner)}
                            style={styles.button}
                        >
                            Get Contract Owner
                        </button>
                    </div>

                    {/* Error Message */}
                    <div style={styles.errorWrapper}>
                        {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
                    </div>

                    {owner && <p style={styles.ownerText}>Contract owner is {owner}</p>}
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    subHeader: {
        fontSize: '1.5em',
        marginBottom: '20px',
        textAlign: 'center',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: '15px',
    },
    label: {
        fontSize: '1em',
        marginBottom: '5px',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '1em',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxSizing: 'border-box',
    },
    buttonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        marginTop: '20px',
    },
    button: {
        backgroundColor: '#0092D1',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    errorWrapper: {
        minHeight: '20px',
        marginTop: '10px',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: '12px',
    },
    ownerText: {
        fontSize: '16px',
        marginTop: '10px',
    },
};

export default ConnectLeaseContractForm;