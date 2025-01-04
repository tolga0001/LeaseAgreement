
import './App.css';
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import TenantLeaseContractForm from "./TenantLeaseContractForm";
import ConnectLeaseContractForm from "./ConnectLeaseContractForm";
import HomePage from './HomePage';
import MetaMaskConnectPage from "./MetaMaskConnectPage";
import LandlordLeaseContractForm from "./LandlordLeaseContractForm";
import DeployContract from "./DeployContract"; // Anasayfa bileşeni

function App() {
    // state variables
    const [account, setAccount] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [role, setRole] = useState(null); // To handle user role (tenant or landlord)



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
                    path="/tenant/leaseContractForm"
                    element={<TenantLeaseContractForm signer={signer} contract={contract} setContract={setContract} />}
                />
                <Route
                    path="/tenant/leaseContractConnectForm"
                    element={<ConnectLeaseContractForm signer={signer} provider={provider} />}
                />
                <Route
                    path="/landlord/leaseContractForm"
                    element={<LandlordLeaseContractForm signer={signer} provider={provider} />}
                />
                <Route
                    path="/landlord/leaseContractConnectForm"
                    element={<ConnectLeaseContractForm signer={signer} provider={provider} />}
                />
            </Routes>

        </Router>
    );
}
export default App;
