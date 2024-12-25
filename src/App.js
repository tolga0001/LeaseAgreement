import './App.css';
import { useState } from "react";
import { ethers } from "ethers";

import DeployLeaseContractForm from "./DeployLeaseContractForm";
import ConnectLeaseContractForm from "./ConnectLeaseContractForm";

function App() {
    // state variables
    const [account, setAccount] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [view, setView] = useState(''); // To handle which view to show

    // Connect to MetaMask
    const connectMetaMask = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                const newProvider = new ethers.providers.Web3Provider(window.ethereum);
                const newSigner = await newProvider.getSigner();
                setProvider(newProvider);
                setSigner(newSigner);
                setAccount(accounts[0]);
                setIsConnected(true);
            } catch (err) {
                console.error("Error connecting to MetaMask", err);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (

        <div className="App" style={styles.container}>
            <h1 style={styles.header}>Lease Agreement Contract</h1>

            {/* MetaMask Connection Section */}
            <div style={styles.section}>
                {!isConnected ? (
                    <button onClick={connectMetaMask} style={styles.button}>Connect MetaMask</button>
                ) : (
                    <div>
                        <p>Connected Account: <span style={styles.account}>{account}</span></p>
                    </div>
                )}
            </div>

            {/* Action Section */}
            {isConnected && (
                <div style={styles.section}>
                    <h2 style={styles.subHeader}>Choose Action</h2>
                    <div style={styles.buttonContainer}>
                        <button onClick={() => setView('leaseContractDeployForm')} style={styles.button}>
                            Deploy Lease Contract
                        </button>
                        <button onClick={() => setView('leaseContractConnectForm')} style={styles.button}>
                            Connect To Existing Lease Contract
                        </button>
                    </div>
                </div>
            )}

            {/* Lease Contract Form */}
            {view === 'leaseContractDeployForm' && (
                <DeployLeaseContractForm
                    signer={signer}
                    contract={contract}
                    setContract={setContract}
                />
            )}

            {/* Connect Lease Contract Form */}
            {view === 'leaseContractConnectForm' && (
                <ConnectLeaseContractForm
                    signer={signer}
                    provider={provider}
                />
            )}

        </div>
    );
}


// Styling
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
    subHeader: {
        fontSize: '1.5rem',
        color: '#555',
        marginBottom: '20px',
    },
    section: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        width: '100%',
        maxWidth: '500px',
    },
    label: {
        fontSize: '1rem',
        color: '#555',
        marginBottom: '10px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginBottom: '15px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    },
    button: {
        backgroundColor: '#0092D1',
        color: 'white',
        padding: '10px 30px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
    },
    account: {
        fontWeight: 'bold',
        color: '#0092D1',
    },
};

export default App;
