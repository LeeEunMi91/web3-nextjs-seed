import React, { useEffect, useRef, useState } from 'react';

import { useCaver } from '../hooks/useCaver';
import JSONPretty from 'react-json-pretty';
import { JsonContainer } from '../components/PrettyJson.style';
import axios from 'axios';
import DepositInput from '../components/DepositInput';
import { Button, Divider, PageHeader, Typography } from 'antd';
const { Title, Text } = Typography;

function deposit({ contract, amount, from }) {
	return contract.methods.mintCard(amount).send({ from, gas: '300000' });
}

const FLUIBank = ({ abi, contractAddress }) => {
	const context = useCaver();
	const privateKey = process.env.KLAYTN_PRIVATE_KEY;
	const { account, contract, provider } = context.initializeWithContract({
		privateKey,
		abi,
		contractAddress
	});

	const [lastTransaction, setLastTransaction] = useState({});

	async function onSubmit(values) {
		console.log('onSubmit');
		if (context === null) {
			alert('No provider');
			return;
		}

		const { toPeb } = context.getUtils();

		const { name, address } = values;
		const transaction = await deposit({
			contract,
			name,
			address,
			from: account.address
		});

		setLastTransaction(transaction);
	}

	return (
		<>
			<div style={{ paddingTop: 24 }}>
				<Title>FLUI Bank</Title>
				<Text>Account: {account.address}</Text>
				<br />
				<Text>Contract Address: {contractAddress}</Text>
				<br />
			</div>

			<Divider />

			<DepositInput onSubmit={onSubmit} />
			<Divider />

			<JsonContainer>
				<Title level={2}>Last Transaction</Title>
				<JSONPretty data={lastTransaction} />
			</JsonContainer>
		</>
	);
};

FLUIBank.getInitialProps = async ({ pathname }) => {
	console.log('FLUIBank::getInitialProps', pathname);
	const abi = await axios.get(process.env.CONTRACT_ABI_JSON).then(res => {
		return res.data;
	});

	const { contractAddress } = await axios
		.get(process.env.CONTRACT_ADDRESS_JSON)
		.then(res => res.data);

	return { abi, contractAddress };
};

export default FLUIBank;
