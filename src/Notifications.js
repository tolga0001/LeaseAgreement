import React from 'react';

const Notifications = () => {
    // Retrieve rental agreements from localStorage
    const agreements = JSON.parse(localStorage.getItem('agreements')) || [];

    // Retrieve account from localStorage
    const account = localStorage.getItem('account');

    // Find the agreement where the tenant matches the account
    const userAgreement = agreements.find(
        agreement => agreement.tenant.toLowerCase() === account.toLowerCase()
    );

    // Log both the agreements and the account to the console for debugging
    console.log('Agreements:', agreements);
    console.log('Account:', account);
    console.log('User Agreement:', userAgreement);

    return (
        <div style={styles.notificationContainer}>
            <div style={styles.notificationHeader}>
                <h2>Show Notifications</h2>
            </div>

            {userAgreement ? (
                <div style={styles.notificationDetails}>
                    <div style={styles.notificationItem}>
                        <strong>Notification From:</strong> {userAgreement.rentalAgreementUI.landlordName
                    }
                    </div>
                    <div style={styles.notificationItem}>
                        <strong>Property Address:</strong> {userAgreement.rentalAgreementUI.propertyAddress}
                    </div>
                    <div style={styles.notificationItem}>
                        <strong>Monthly Rent:</strong> {userAgreement.rentalAgreementUI.monthlyRent} ETH
                    </div>
                    <div style={styles.notificationItem}>
                        <strong>Rent Increase Rate:</strong> {userAgreement.rentalAgreementUI.rentIncreaseRate}%
                    </div>
                </div>
            ) : (
                <div style={styles.noNotifications}>No rental agreements found for this account.</div>
            )}
        </div>
    );
};

// Styles object
const styles = {
    notificationContainer: {
        backgroundColor: '#f4f4f4',
        borderRadius: '10px',
        padding: '20px',
        width: '50%',
        margin: 'auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
    },
    notificationHeader: {
        textAlign: 'center',
        fontSize: '1.8rem',
        color: '#2e3a59',
        marginBottom: '20px',
    },
    notificationDetails: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    notificationItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #ddd',
    },
    noNotifications: {
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#888',
        marginTop: '20px',
    },
};

export default Notifications;
