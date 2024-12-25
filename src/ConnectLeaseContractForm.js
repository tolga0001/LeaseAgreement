import React, { useState } from 'react';
import { Contract, utils } from 'ethers';

const ConnectLeaseContractForm = ({ signer, provider }) => {
    const [contractAddress, setContractAddress] = useState('');
    const [lotteryContractABI, setLotteryContractABI] = useState('');
    const [view, setView] = useState('');
    const [, setGasUsed] = useState(null);
    const [randomNumberHash, setRandomNumberHash] = useState('');
    const [owner, setOwner] = useState('');
    const [isGetContractOwnerPressed, setIsGetContractOwnerPressed] = useState(false);

    const connectToDeployedContract = async () => {
        if (!signer) {
            alert("Please connect MetaMask first.");
            return;
        }
        setView('connecting');

        try {
            const contract = new Contract(contractAddress, lotteryContractABI, signer);

            // Check if the contract exists at the given address
            const bytecode = await provider.getCode(contractAddress);
            if (bytecode === '0x') {
                throw new Error("Contract not found at the provided address.");
            }
            console.log("Contract bytecode successfully retrieved.");

            // Fetch and display the contract owner
            const owner = await contract.displayContractOwner();
            console.log("Contract Owner Address:", owner);
            setOwner(owner);

            // Fetch and log the ticket price in Ether
            const ticketPriceWei = await contract.displayTicketPrice();
            const ticketPriceEth = utils.formatEther(ticketPriceWei);
            console.log(`The ticket price is: ${ticketPriceEth} ETH`);

            setView('connected');
        } catch (error) {
            console.error("Error connecting to contract:", error);
            setView('error');
            alert("Error connecting to contract: " + error.message);
        }
    };

    const purchaseTicket = async () => {
        if (!randomNumberHash) {
            alert("Please enter a valid random number hash.");
            return;
        }

        try {
            const contract = new Contract(contractAddress, lotteryContractABI, signer);
            const randomHashBytes32 = utils.formatBytes32String(randomNumberHash);

            // Fetch the ticket price
            const ticketPriceWei = await contract.ticketPrice();

            // Purchase the ticket
            const tx = await contract.purchaseTicket(randomHashBytes32, {
                value: ticketPriceWei,
            });

            const receipt = await tx.wait();
            setGasUsed(receipt.gasUsed.toString());

            console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        } catch (error) {
            console.error("Error purchasing ticket:", error);
            alert("Error purchasing ticket: " + error.message);
        } finally {
            setView('connected');
        }
    };

    return (
        <div>
            <div style={styles.section}>
                <h2 style={styles.subHeader}>Connect To Existing Contract</h2>
                <label style={styles.label}>
                    Contract Address:
                    <input
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        style={styles.input}
                    />
                </label>

                <label style={styles.label}>
                    Contract ABI:
                    <textarea
                        value={lotteryContractABI}
                        onChange={(e) => setLotteryContractABI(e.target.value)}
                        style={styles.input}
                    />
                </label>

                <button onClick={connectToDeployedContract} style={styles.button}>
                    {view === 'connecting' ? 'Connecting...' : 'Connect to Contract'}
                </button>
            </div>

            {view === 'connected' && (
                <div style={styles.section}>
                    <p>Successfully connected to the existing contract!</p>

                    <label style={styles.label}>
                        Enter Your Random Number Hash (32-byte string):
                        <input
                            type="text"
                            value={randomNumberHash}
                            onChange={(e) => setRandomNumberHash(e.target.value)}
                            style={styles.input}
                            placeholder="Enter hash"
                        />
                    </label>

                    <div style={styles.buttonWrapper}>
                        <button onClick={purchaseTicket} style={styles.button}>
                            Purchase Ticket
                        </button>

                        <button
                            onClick={() => setIsGetContractOwnerPressed(true)}
                            style={styles.button}
                        >
                            Get Contract Owner
                        </button>
                    </div>

                    {isGetContractOwnerPressed && (
                        <p style={styles.ownerText}>Contract owner is {owner}</p>
                    )}
                </div>
            )}

            {view === 'error' && (
                <div style={styles.section}>
                    <p>Error connecting to the contract. Please check the contract address and try again.</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    section: {
        marginBottom: '20px',
    },
    button: {
        backgroundColor: '#0092D1',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    input: {
        padding: '5px',
        fontSize: '1em',
        width: '100%',
        marginBottom: '10px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
    },
    subHeader: {
        fontSize: '1.5em',
        marginBottom: '10px',
    },
    buttonWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    ownerText: {
        marginTop: '10px',
        fontSize: '16px',
    },
};

export default ConnectLeaseContractForm;
