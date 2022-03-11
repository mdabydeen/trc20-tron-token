import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { parseEther, formatEther } from '@ethersproject/units';
import tronWeb from '../lib/tronweb'

const contractAddress = "TYkqh3rSFu2CekB4rgn8LebWF5GR41RVt7";

function Home() {
    const [connected, setConnected] = useState(false)
    const [noAccount, setNoAccount] = useState(false);
    const [accountBalance, setAccountBalance] = useState(0)
    const [tokenName, setTokenName] = useState("")
    const [tokenSymbol, setTokenSymbol] = useState("")
    const [toWallet, setToWallet] = useState("")
    const [amount, setAmount] = useState(0)
    const [transaction, setTransaction] = useState('')

    async function requestAccount()  {
        if (typeof window.tronLink !== 'undefined') {
            const accounts = await window.tronLink.request({
                method: 'tron_requestAccounts',
            })
    
            if (accounts.code === 200) {
                setConnected(true)
            }
    
            tronWeb.setAddress(window?.tronWeb.defaultAddress.base58.toString())
    
        
        } else {
            // tell the user to install the tronlink extension
            // /alert('go install the tronlink plugin')
            setNoAccount(true);
        }
    }

    useEffect(() => {
        requestAccount()
    }, [])

    async function getTokenName() {
        try {
            let contract = await tronWeb.contract().at(contractAddress);
            //Use call to execute a pure or view smart contract method.
            // These methods do not modify the blockchain, do not cost anything to execute and are also not broadcasted to the network.
            let result = await contract.name().call();
            setTokenName(result);
            console.log('result: ', result);
        } catch(error) {
            console.error("trigger smart contract error",error)
        }
    }

    async function getTokenSymbol() {
        try {
            let contract = await tronWeb.contract().at(contractAddress);
            //Use call to execute a pure or view smart contract method.
            // These methods do not modify the blockchain, do not cost anything to execute and are also not broadcasted to the network.
            let result = await contract.symbol().call();
            setTokenSymbol(result);
            console.log('result: ', result);
        } catch(error) {
            console.error("trigger smart contract error",error)
        }
    }

    async function getAccountBalance() {
        try {
            let contract = await tronWeb.contract().at(contractAddress);

            let result = await contract.balanceOf(tronWeb.defaultAddress.base58).call();
            console.log('result: ', result);
            setAccountBalance(parseFloat(formatEther(result.toString())))
        } catch(error) {
            console.error("trigger smart contract error",error)
        }
    }

    async function transferToken() {

        let { transaction, result } = await tronWeb.transactionBuilder.triggerSmartContract(
            contractAddress,
            'transfer(address,uint256)',
            {
                feeLimit: 1_000_000,
                callValue: 0,
            },
            [
                {
                    type: 'address',
                    value: toWallet
                },
                {
                    type: 'uint256',
                    value: amount
                }
            ]
        );

        if (! result.result ) {
            console.error("error:", result);
            return;
        }

        console.log("transaction =>", JSON.stringify(transaction, null, 2));

        console.log('privateKey', process.env.NEXT_PUBLIC_PRIVATE_KEY_NILE)

        const signedTransaction = await tronWeb.trx.sign(transaction, process.env.NEXT_PUBLIC_PRIVATE_KEY_NILE);
        console.log('Signature: ', signedTransaction);

        const broadcast = await tronWeb.trx.sendRawTransaction(signedTransaction);
        console.log('result ', broadcast);
        setTransaction();


    }


    useEffect(() => {
        if (connected) {
            getTokenName()
            getTokenSymbol();
            getAccountBalance()
        }
    }, [connected]);

    // Direct user to install tronLink plugin if not installed. 
    if (noAccount) {
        return (
            <div className="flex min-h-screen flex-row items-center justify-center py-2">
                Please install &nbsp; <Link href="https://www.tronlink.org/"><a> TronLink plugin to continue</a></Link>
            </div>
        )
    }

    return (
        <div>
            Index
            <p>Connected Account: {tronWeb.defaultAddress.base58.toString()}</p>
            <p>Token Name: {tokenName}</p>
            <p>Token Symbol: {tokenSymbol}</p>
            <p>Token Address: {contractAddress}</p>
            <p>Account Balance: {accountBalance}</p>

            <form className="mt-8 space-y-6" action="#" method="POST">
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="wallet-address" className="sr-only">
                  Wallet 
                </label>
                <input
                  id="wallet-address"
                  name="wallet"
                  type="text"
                  autoComplete="wallet"
                  value={toWallet}
                  onChange={(e) => setToWallet(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Wallet to be transferred to"
                />
              </div>
              <div>
                <label htmlFor="amount" className="sr-only">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  autoComplete="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Amount"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={transferToken}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
               Send
              </button>
            </div>
          </form>

        </div>
    )
}

export default Home