import { useEffect, useState } from 'react';

export default function useConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState(null);
    const [chainId, setChainId] = useState(null);

    // Update state variables from list of accounts
    const handlerAccountsChanged = (accounts) => {
        const connected = accounts && accounts.length > 0;
        setIsConnected(connected);
        if (connected) {
            setAddress(accounts[0]);
        } else {
            setAddress(null);
        }
    };

    // Initialize state variables
    window.web3.eth.requestAccounts().then(handlerAccountsChanged)
    window.web3.eth.getChainId().then(setChainId)    

    // Event listener for when a user logs in/out or switches accounts
    useEffect(() => {
        window.ethereum.on('accountsChanged', handlerAccountsChanged);
        window.ethereum.on('chainChanged', setChainId);

        return () => {
            window.ethereum.removeListener('accountsChanged', handlerAccountsChanged);
        };
    }, []);

    return { isConnected, address, chainId };
}