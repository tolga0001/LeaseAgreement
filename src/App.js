
import './App.css';
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TenantLeaseContractForm from "./TenantLeaseContractForm";
import ConnectLeaseContractForm from "./ConnectLeaseContractForm";
import HomePage from './HomePage';
import MetaMaskConnectPage from "./MetaMaskConnectPage";
import LandlordLeaseContractForm from "./LandlordLeaseContractForm";
import DeployContract from "./DeployContract";
import Notifications from "./Notifications"; // Anasayfa bileşeni

function App() {
    // state variables
    const [account, setAccount] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [role, setRole] = useState(null); // To handle user role (tenant or landlord)
    const [connectedContract,setConnectedContract] = useState(null);



    return (
            <Router>
                {/* Route for the Lease Agreement Contract title and MetaMask connection */}

                {/* Route to the Home Page */}
                <Routes>
                    <Route
                        path="/"
                        element={
                            <MetaMaskConnectPage
                                isConnected={isConnected}
                                account={account}
                                setIsConnected={setIsConnected}
                                setAccount={setAccount}
                                setProvider={setProvider}
                                setSigner={setSigner}
                            />
                        }
                    />

                    <Route
                        path="/home"
                        element={<HomePage
                            isConnected={isConnected}
                            role={role}
                            setRole={setRole}
                        />}
                    />
                    <Route
                        path="/deployContract"
                        element={<DeployContract
                            signer={signer}
                        />}
                    />
                    <Route
                        path="/leaseContractConnectForm"
                        element={<ConnectLeaseContractForm account={account} signer={signer} provider={provider} setconnectedContract={setConnectedContract} role={role} />}
                    />
                    <Route
                        path="/tenant/notifications"
                        element={<Notifications connectedContract = {connectedContract} />}
                    />

                    <Route
                        path="/landlord/leaseContractForm"
                        element={<LandlordLeaseContractForm landlordAddress={account} connectedContract={connectedContract} />}
                    />

                </Routes>

            </Router>


    );
}
export default App;
