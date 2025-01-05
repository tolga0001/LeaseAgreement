import React, { useState } from "react";
import { Contract, ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const ConnectLeaseContractForm = ({
                                      signer,
                                      provider,
                                      setconnectedContract,
                                      role,
                                  }) => {
    const [contractAddress, setContractAddress] = useState("");
    const [leaseContractABI, setLeaseContractABI] = useState("");
    const [view, setView] = useState("");
    const [owner, setOwner] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const [connectedContract, setContract] = useState(null);
    const [agreementAcceptId, setAcceptAgreementId] = useState("");
    const [agreementRefuseId, setRefuseAgreementId] = useState("");
    const [agreementWarningId, setWarningAgreementId] = useState("");
    const [agreementEvacuationId, setEvacuationAgreementId] = useState("");
    const [rentAmount, setRentAmount] = useState("");

    // Validation for required fields
    const validateFields = () => {
        if (!contractAddress.trim()) {
            setErrorMessage("Deployed Contract Address is required.");
            return false;
        }
        if (!leaseContractABI.trim()) {
            setErrorMessage("Deployed Contract ABI (JSON) is required.");
            return false;
        }
        return true;
    };

    // Connect to the deployed contract
    const connectToDeployedContract = async () => {
        if (!validateFields()) return;

        setView("connecting");
        setErrorMessage("");

        try {
            const contract = new Contract(
                contractAddress,
                JSON.parse(leaseContractABI),
                signer
            );
            setconnectedContract(contract);
            setContract(contract);

            const bytecode = await provider.getCode(contractAddress);
            if (bytecode === "0x") {
                throw new Error("Contract not found at the provided address.");
            }

            const contractOwner = await contract.owner();
            setOwner(contractOwner);
            setView("connected");
        } catch (error) {
            const errorMessage = error.message;

            // Extract the part starting from "reverted:" in the error message
            const revertedMessageMatch = errorMessage.match(/reverted: (.+?)["\n]/);
            if (revertedMessageMatch && revertedMessageMatch[1]) {
                setErrorMessage(`Failed to accept agreement: ${revertedMessageMatch[1]}`);
            } else {
                // Fallback to show the full error message if the pattern isn't found
                setErrorMessage(`Failed to accept agreement: ${errorMessage}`);
            }
        }
    };

    // Handle valid Agreement ID input for accepting
    const handleAcceptAgreementIdChange = (e) => {
        const value = e.target.value.trim();
        if (/^\d*$/.test(value)) {
            setAcceptAgreementId(value);
            setErrorMessage("");
        } else {
            setErrorMessage("Agreement ID must only contain numbers.");
        }
    };

    // Handle valid Agreement ID input for refusing
    const handleRefuseAgreementIdChange = (e) => {
        const value = e.target.value.trim();
        if (/^\d*$/.test(value)) {
            setRefuseAgreementId(value);
            setErrorMessage("");
        } else {
            setErrorMessage("Agreement ID must only contain numbers.");
        }
    };
    const handleWarningAgreementIdChange = (e) => {
        const value = e.target.value.trim();
        if (/^\d*$/.test(value)) {
            setWarningAgreementId(value);
            setErrorMessage("");
        } else {
            setErrorMessage("Agreement ID must only contain numbers.");
        }
    }
    const handleEvacuationAgreementIdChange = (e) => {
        const value = e.target.value.trim();
        if (/^\d*$/.test(value)) {
            setEvacuationAgreementId(value);
            setErrorMessage("");
        } else {
            setErrorMessage("Agreement ID must only contain numbers.");
        }
    }

    // Handle valid Rent Amount input
    const handleRentAmountChange = (e) => {
        const value = e.target.value.trim();
        if (/^\d*(\.\d*)?$/.test(value)) {
            // Allow digits and decimals
            setRentAmount(value);
            setErrorMessage("");
        } else {
            setErrorMessage("Rent amount must be a valid number.");
        }
    };

    // Function to handle sending a warning to the tenant
    const handleSendWarning = async () => {
        if (!agreementWarningId.trim()) {
            setErrorMessage('Please provide a valid Agreement ID.');
            return;
        }

        try {
            setErrorMessage('');
            const tx = await connectedContract.sendWarning(agreementWarningId); // Transact with smart contract
            console.log('Send Warning Transaction Submitted:', tx.hash);

            await tx.wait(); // Wait for the transaction to confirm
            console.log('Warning successfully sent.');
        } catch (error) {
            const errorMessage = error.message;

            // Extract the part starting from "reverted:" in the error message
            const revertedMessageMatch = errorMessage.match(/reverted: (.+?)["\n]/);
            if (revertedMessageMatch && revertedMessageMatch[1]) {
                setErrorMessage(`Failed to accept agreement: ${revertedMessageMatch[1]}`);
            } else {
                // Fallback to show the full error message if the pattern isn't found
                setErrorMessage(`Failed to accept agreement: ${errorMessage}`);
            }
        }
    };


    // Accept Agreement
    const handleAcceptAgreement = async () => {
        if (!agreementAcceptId.trim()) {
            setErrorMessage("Please enter a valid Agreement ID.");
            return;
        }

        try {
            const tx = await connectedContract.acceptRentalAgreement(agreementAcceptId, {
                value: ethers.utils.parseEther("0.1"),
            });
            await tx.wait();
            setErrorMessage(""); // Clear error message on success
        } catch (error) {
            const errorMessage = error.message;

            // Extract the part starting from "reverted:" in the error message
            const revertedMessageMatch = errorMessage.match(/reverted: (.+?)["\n]/);
            console.log(revertedMessageMatch)
            if (revertedMessageMatch && revertedMessageMatch[1]) {
                setErrorMessage(`Failed to accept agreement: ${revertedMessageMatch[1]}`);
            } else {
                // Fallback to show the full error message if the pattern isn't found
                setErrorMessage(`Failed to accept agreement: ${errorMessage}`);
            }
        }
    };

    // Refuse Agreement
    const handleRefuseAgreement = async () => {
        if (!agreementRefuseId.trim()) {
            setErrorMessage("Please enter a valid Agreement ID.");
            return;
        }

        try {
            const tx = await connectedContract.refuseRentalAgreement(
                agreementRefuseId
            );
            await tx.wait();
            setErrorMessage(""); // Clear error message on success
        } catch (error) {
            const errorMessage = error.message;

            // Extract the part starting from "reverted:" in the error message
            const revertedMessageMatch = errorMessage.match(/reverted: (.+?)["\n]/);
            console.log(revertedMessageMatch)
            if (revertedMessageMatch && revertedMessageMatch[1]) {
                setErrorMessage(`Failed to accept agreement: ${revertedMessageMatch[1]}`);
            } else {
                // Fallback to show the full error message if the pattern isn't found
                setErrorMessage(`Failed to accept agreement: ${errorMessage}`);
            }
        }
    };
    // Refuse Agreement
    const handleEvacuation = async () => {
        if (!agreementEvacuationId.trim()) {
            setErrorMessage("Please enter a valid Agreement ID.");
            return;
        }

        try {
            const tx = await connectedContract.revokeUsageRights(
                agreementEvacuationId
            );
            await tx.wait();
            setErrorMessage(""); // Clear error message on success
        } catch (error) {
            const errorMessage = error.message;

            // Extract the part starting from "reverted:" in the error message
            const revertedMessageMatch = errorMessage.match(/reverted: (.+?)["\n]/);
            console.log(revertedMessageMatch)
            if (revertedMessageMatch && revertedMessageMatch[1]) {
                setErrorMessage(`Failed to accept agreement: ${revertedMessageMatch[1]}`);
            } else {
                // Fallback to show the full error message if the pattern isn't found
                setErrorMessage(`Failed to accept agreement: ${errorMessage}`);
            }
        }
    };

    // Pay Rent (Dynamic)
    const handlePayRent = async () => {
        if (!rentAmount.trim() || isNaN(rentAmount) || Number(rentAmount) <= 0) {
            setErrorMessage("Please enter a valid rent amount greater than 0.");
            return;
        }

        try {
            const tx = await connectedContract.payRent({
                value: ethers.utils.parseUnits(rentAmount, 0), // Treat rentAmount as Wei
            });
            await tx.wait();
            setErrorMessage(""); // Clear error message on success
        } catch (error) {
            const errorMessage = error.message;

            // Extract the part starting from "reverted:" in the error message
            const revertedMessageMatch = errorMessage.match(/reverted: (.+?)["\n]/);
            console.log(revertedMessageMatch)
            if (revertedMessageMatch && revertedMessageMatch[1]) {
                setErrorMessage(`Failed to accept agreement: ${revertedMessageMatch[1]}`);
            } else {
                // Fallback to show the full error message if the pattern isn't found
                setErrorMessage(`Failed to accept agreement: ${errorMessage}`);
            }
        }
    };

    // Add Tenant
    const handleAddTenant = async () => {
        try {
            const tx = await connectedContract.addTenant(); // Contract's addTenant method
            console.log("Tenant added transaction: ", tx.hash);
            await tx.wait();
            setErrorMessage(""); // Clear error message on success
        } catch (error) {
            console.error("Failed to add tenant: ", error);
            setErrorMessage("Failed to add Tenant. Please try again.");
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
                        disabled={view === "connecting"}
                        onClick={connectToDeployedContract}
                    >
                        {view === "connecting" ? "Connecting..." : "Connect"}
                    </button>
                </div>

                {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
            </div>

            {view === "connected" && (
                <div style={styles.resultSection}>
                    <h3 style={styles.successMessage}>
                        Successfully connected to the contract!
                    </h3>
                    <p style={styles.ownerText}>Contract Owner: {owner}</p>

                    {role === "tenant" && (
                        <div>
                            <div style={{marginTop: "15px", display: "flex", justifyContent: "center"}}>
                                {/* Add Tenant */}
                                <button
                                    style={{
                                        backgroundColor: "#007bff",
                                        color: "#fff",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={handleAddTenant}
                                >
                                    Add Tenant
                                </button>
                            </div>
                            <div style={{marginTop: "20px"}}>
                            {/* Accept Agreement */}
                                <input
                                    type="text"
                                    placeholder="Enter Agreement ID"
                                    value={agreementAcceptId}
                                    onChange={handleAcceptAgreementIdChange}
                                    style={{
                                        marginRight: "10px",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                    }}
                                />
                                <button
                                    style={{backgroundColor: "#ffc107", ...styles.button}}
                                    onClick={handleAcceptAgreement}
                                >
                                    Accept Agreement
                                </button>
                            </div>

                            <div style={{marginTop: "15px"}}>
                                {/* Refuse Agreement */}
                                <input
                                    type="text"
                                    placeholder="Enter Agreement ID"
                                    value={agreementRefuseId}
                                    onChange={handleRefuseAgreementIdChange}
                                    style={{
                                        marginRight: "10px",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                    }}
                                />
                                <button
                                    style={{backgroundColor: "#dc3545", ...styles.button}}
                                    onClick={handleRefuseAgreement}
                                >
                                    Refuse Agreement
                                </button>
                            </div>

                            <div style={{marginTop: "15px"}}>
                                {/* Pay Rent */}
                                <input
                                    type="text"
                                    placeholder="Enter rent amount in Ether"
                                    value={rentAmount}
                                    onChange={handleRentAmountChange}
                                    style={{
                                        marginRight: "10px",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                    }}
                                />
                                <button
                                    style={{backgroundColor: "#28A745", ...styles.button}}
                                    onClick={handlePayRent}
                                >
                                    Pay Rent
                                </button>
                            </div>


                        </div>
                    )}

                    {role === "landlord" && (
                        <div>
                            <button
                                style={{
                                    ...styles.button,
                                    backgroundColor: "#6c757d",
                                    marginTop: "10px",
                                }}
                                onClick={() => navigate("/landlord/leaseContractForm")}
                            >
                                Create Agreement
                            </button>
                            <div style={{marginTop: "20px"}}>
                                {/* Accept Agreement */}
                                <input
                                    type="text"
                                    placeholder="Enter Agreement ID"
                                    value={agreementWarningId}
                                    onChange={handleWarningAgreementIdChange}
                                    style={{
                                        marginRight: "10px",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                    }}
                                />
                                <button
                                    style={{backgroundColor: "#ffc107", ...styles.button}}
                                    onClick={handleSendWarning}
                                >
                                    Send Warning
                                </button>
                            </div>
                            <div style={{marginTop: "20px"}}>
                                {/* Accept Agreement */}
                                <input
                                    type="text"
                                    placeholder="Enter Agreement ID"
                                    value={agreementEvacuationId}
                                    onChange={handleEvacuationAgreementIdChange}
                                    style={{
                                        marginRight: "10px",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                    }}
                                />
                                <button
                                    style={{backgroundColor: "red", ...styles.button}}
                                    onClick={handleEvacuation}
                                >
                                    Start Evacuation
                                </button>
                            </div>

                        </div>

                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
        minHeight: "100vh",
    },
    form: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        textAlign: "center",
    },
    title: {
        fontSize: "1.5rem",
        marginBottom: "1rem",
    },
    inputGroup: {
        marginBottom: "15px",
    },
    label: {
        fontSize: "1rem",
        marginBottom: "5px",
    },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "5px",
    },
    textarea: {
        width: "100%",
        padding: "10px",
        borderRadius: "5px",
    },
    buttonWrapper: {
        marginTop: "15px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "1rem",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    errorMessage: {
        color: "red",
        marginTop: "10px",
    },
    successMessage: {
        color: "#28a745",
        marginBottom: "10px",
    },
    resultSection: {
        marginTop: "20px",
        padding: "20px",
        borderRadius: "8px",
    },
};

export default ConnectLeaseContractForm;