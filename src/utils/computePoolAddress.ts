import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { Token, SupportedChainId, computeZksyncCreate2Address } from '@pollum-io/sdk-core'
import { FeeAmount, POOL_INIT_CODE_HASH_MAP, POOL_INIT_CODE_HASH } from '../constants'

/**
 * Computes a pool address
 * @param factoryAddress The Jingo Finance V3 factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pool address
 */
export function computePoolAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride
}: {
  factoryAddress: string
  tokenA: Token
  tokenB: Token
  fee: FeeAmount
  initCodeHashManualOverride?: string
}): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
  const codehash = POOL_INIT_CODE_HASH_MAP[tokenA.chainId] ?? POOL_INIT_CODE_HASH
  const salt = keccak256(
    ['bytes'],
    [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0.address, token1.address, fee])]
  )

  switch (token0.chainId) {
    case SupportedChainId.ZKSYS_TANENBAUM:
      return computeZksyncCreate2Address(factoryAddress, initCodeHashManualOverride ?? codehash, salt)
    default:
      return getCreate2Address(factoryAddress, salt, initCodeHashManualOverride ?? codehash)
  }
}
