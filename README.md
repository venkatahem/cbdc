CBDC Demo using hyperledger besu

Running instructions
1)
create folder and subfolders of structure

besu-pvt-network(folder)
	|
	|__node1(folder)
	|	 |	
	|	 |____data(folder)
	|
	|__node2(folder)
	|	 |	
	|	 |____data(folder)
	|
	|__node3(folder)
	|	 |	
	|	 |____data(folder)
	|
	|__node4(folder)
	|	 |	
	|	 |____data(folder)
	|
	|__genesis.json(file)
		 

node1 will be root node 

in node1 folder run the following command in cmd
	besu --data-path=data --genesis-file=../genesis.json --miner-enabled --miner-coinbase=fe3b557e8fb62b89f4916b721be55ceb828dbd73 --rpc-http-enabled --host-allowlist="*" --rpc-http-cors-origins="all" --rpc-http-api=ADMIN,ETH,NET,WEB3 --min-gas-price=0
	
	on running this command this will generate an enode url, copy that

in node2 folder in cmd run
	besu --data-path=data --genesis-file=../genesis.json --bootnodes=<enode_url> --p2p-port=30304
	
in node3 folder in cmd run
	besu --data-path=data --genesis-file=../genesis.json --bootnodes=<enode_url> --p2p-port=30305
	
in node4 folder in cmd run
	besu --data-path=data --genesis-file=../genesis.json --bootnodes=<enode_url> --p2p-port=30306
	
	
	
//sample enode url = enode://44c3a3a3173e200bb8028f11cdbba96138e1c88439b93f383d061c055407c65fe240b4f616bf8d09f5c525f3534439892609ab32cc680a45be3b201001a0ed73@127.0.0.1:30303


genesis.json file content
-------------------------

{
    "config": {
      "berlinBlock": 0,
      "ethash": {
        "fixeddifficulty": 1000
      },
      "chainID": 1337
    },
    "nonce": "0x42",
    "gasLimit": "0x1000000",
    "difficulty": "0x10000",
    "alloc": {
      "fe3b557e8fb62b89f4916b721be55ceb828dbd73": {
        "privateKey": "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
        "comment": "private key and this comment are ignored.  In a real chain, the private key should NOT be stored",
        "balance": "0xad78ebc5ac6200000"
      },
      "f17f52151EbEF6C7334FAD080c5704D77216b732": {
        "privateKey": "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
        "comment": "private key and this comment are ignored.  In a real chain, the private key should NOT be stored",
        "balance": "90000000000000000000000"
      }
    }
}

-------------------------

2)
On successfully running the besu network setup and connect metamask to besu

metamask ---> settings ---> network ---> add network ---> add network manually

Network Name = besu
New RPC URL = http://127.0.0.1:8545
Chain ID = 1337
Currency symbol = ETH

on successful connection add some accounts in meta mask

add the recovery phrase in truffle.config file at mnemonic

3)
in the project root directory 
run

truffle compile --all --reset

truffle migrate --reset --network=besu

//change the solidity version to 0.8.11 or something near to that, latest version won't work


4)
run the client folder
npm run dev

the accounts and transactions should be present in the UI