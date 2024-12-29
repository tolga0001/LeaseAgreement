import { Link } from 'react-router-dom';

function HomePage({ role, setRole }) {
    const handleRoleSelection = (selectedRole) => setRole(selectedRole);

    return (
        <div style={styles.section}>
            <div>
                <h1 style={styles.header}>Welcome to Lease Manager</h1>
                <h2 style={styles.subHeader}>You are connected! Are you a Tenant or a Landlord?</h2>

                <div style={styles.buttonContainer}>
                    <button
                        onClick={() => handleRoleSelection('tenant')}
                        style={{ ...styles.button, backgroundColor: '#5BC0EB' }} // Blue for Tenant button
                    >
                        Tenant
                    </button>
                    <button
                        onClick={() => handleRoleSelection('landlord')}
                        style={{ ...styles.button, backgroundColor: '#FF6F61' }} // Red for Landlord button
                    >
                        Landlord
                    </button>
                </div>

                {/* Tenant-specific Actions */}
                {role === 'tenant' && (
                    <div style={styles.roleContainer}>
                        <h2 style={{ ...styles.roleHeader, color: '#5BC0EB' }}>Welcome, Tenant</h2>
                        <p style={styles.roleDescription}>Choose one of the available actions:</p>
                        <div style={styles.actionButtonContainer}>
                            <Link to="/tenant/leaseContractDeployForm" state={{ role }}>
                                <button style={styles.tenantActionButton}>
                                    Deploy Lease Contract
                                </button>
                            </Link>
                            <Link to="/tenant/leaseContractConnectForm" state={{ role }}>
                                <button style={styles.tenantActionButton}>
                                    Connect to Existing Lease Contract
                                </button>
                            </Link>
                            <button style={styles.tenantActionButton}>
                                Pay Rent
                            </button>
                        </div>
                    </div>
                )}

                {/* Landlord-specific Actions */}
                {role === 'landlord' && (
                    <div style={styles.roleContainer}>
                        <h2 style={{ ...styles.roleHeader, color: '#FF6F61' }}>Welcome, Landlord</h2>
                        <p style={styles.roleDescription}>Choose one of the available actions:</p>
                        <div style={styles.actionButtonContainer}>
                            <Link to="/landlord/leaseContractDeployForm">
                                <button style={styles.landlordActionButton}>Deploy Lease Contract</button>
                            </Link>
                            <Link to="/landlord/leaseContractConnectForm">
                                <button style={styles.landlordActionButton}>Connect to Existing Lease Contract</button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    section: {
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '16px', // Softer rounded corners
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Gentle shadow
        maxWidth: '600px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
    },
    header: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    subHeader: {
        fontSize: '1.2rem',
        color: '#555',
        marginBottom: '20px',
        lineHeight: '1.5',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center', // Horizontally center the buttons
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap', // Ensure buttons don't break on small screens
    },
    button: {
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '12px', // Softer corners
        border: 'none',
        fontSize: '1.1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
    },
    roleContainer: {
        marginTop: '20px',
        textAlign: 'left',
    },
    roleHeader: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    roleDescription: {
        fontSize: '1rem',
        color: '#666',
        marginBottom: '15px',
    },
    actionButtonContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center buttons vertically
        gap: '10px',
    },
    tenantActionButton: {
        backgroundColor: '#5BC0EB', // Tenant theme blue
        color: '#fff',
        padding: '12px 20px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '10px', // Rounded corners
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
    },
    landlordActionButton: {
        backgroundColor: '#FF6F61', // Landlord theme red
        color: '#fff',
        padding: '12px 20px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '10px', // Rounded corners
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
    },
};

export default HomePage;