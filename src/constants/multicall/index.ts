import { ChainId } from 'emerald-uniswap-sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xE5BD10490ed1Ee3A4460e99eB086C71896A70dd7',
  [ChainId.TESTNET]: '0xE5BD10490ed1Ee3A4460e99eB086C71896A70dd7'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
