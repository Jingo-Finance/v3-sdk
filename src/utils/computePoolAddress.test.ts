import { Token } from '@jingofi/sdk-core'
import { FeeAmount } from '../constants'
import { computePoolAddress } from './computePoolAddress'

describe('#computePoolAddress', () => {
  const factoryAddress = '0x1111111111111111111111111111111111111111'
  it('should correctly compute the pool address', () => {
    const tokenA = new Token(9745, '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', 18, 'USDT0', 'USD Coin')
    const tokenB = new Token(9745, '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34', 18, 'USDe', 'USDe Stablecoin')
    const result = computePoolAddress({
      factoryAddress,
      fee: FeeAmount.LOW,
      tokenA,
      tokenB
    })

    expect(result).toEqual('0xc8bdfFb2f4C656743190727AB0C28Cb36d67F96c')
  })

  it('should correctly compute the pool address', () => {
    const USDT0 = new Token(9745, '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', 18, 'USDT0', 'USD Coin')
    const USDe = new Token(9745, '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34', 18, 'USDe', 'USDe Stablecoin')
    let tokenA = USDT0
    let tokenB = USDe
    const resultA = computePoolAddress({
      factoryAddress,
      fee: FeeAmount.LOW,
      tokenA,
      tokenB
    })

    tokenA = USDe

    tokenB = USDT0
    const resultB = computePoolAddress({
      factoryAddress,
      fee: FeeAmount.LOW,
      tokenA,
      tokenB
    })

    expect(resultA).toEqual(resultB)
  })
})
