import { Token, CurrencyAmount, WETH9 } from '@jingofi/sdk-core'
import { FeeAmount, TICK_SPACINGS } from '../constants'
import { nearestUsableTick } from '../utils/nearestUsableTick'
import { TickMath } from '../utils/tickMath'
import { Pool } from './pool'
import { encodeSqrtRatioX96 } from '../utils/encodeSqrtRatioX96'
import JSBI from 'jsbi'
import { NEGATIVE_ONE } from '../internalConstants'

const ONE_ETHER = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))

describe('Pool', () => {
  const USDT0 = new Token(9745, '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', 6, 'USDT0', 'USD Coin')
  const USDe = new Token(9745, '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34', 18, 'USDe', 'USDe Stablecoin')

  describe('constructor', () => {
    it('cannot be used for tokens on different chains', () => {
      expect(() => {
        new Pool(USDT0, WETH9[5701], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
      }).toThrow('CHAIN_IDS')
    })

    it('fee must be integer', () => {
      expect(() => {
        new Pool(USDT0, WETH9[9745], FeeAmount.MEDIUM + 0.5, encodeSqrtRatioX96(1, 1), 0, 0, [])
      }).toThrow('FEE')
    })

    it('fee cannot be more than 1e6', () => {
      expect(() => {
        new Pool(USDT0, WETH9[9745], 1e6, encodeSqrtRatioX96(1, 1), 0, 0, [])
      }).toThrow('FEE')
    })

    it('cannot be given two of the same token', () => {
      expect(() => {
        new Pool(USDT0, USDT0, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
      }).toThrow('ADDRESSES')
    })

    it('price must be within tick price bounds', () => {
      expect(() => {
        new Pool(USDT0, WETH9[9745], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 1, [])
      }).toThrow('PRICE_BOUNDS')
      expect(() => {
        new Pool(USDT0, WETH9[9745], FeeAmount.MEDIUM, JSBI.add(encodeSqrtRatioX96(1, 1), JSBI.BigInt(1)), 0, -1, [])
      }).toThrow('PRICE_BOUNDS')
    })

    it('works with valid arguments for empty pool medium fee', () => {
      new Pool(USDT0, WETH9[9745], FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
    })

    it('works with valid arguments for empty pool low fee', () => {
      new Pool(USDT0, WETH9[9745], FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
    })

    it('works with valid arguments for empty pool lowest fee', () => {
      new Pool(USDT0, WETH9[9745], FeeAmount.LOWEST, encodeSqrtRatioX96(1, 1), 0, 0, [])
    })

    it('works with valid arguments for empty pool high fee', () => {
      new Pool(USDT0, WETH9[9745], FeeAmount.HIGH, encodeSqrtRatioX96(1, 1), 0, 0, [])
    })
  })

  describe('#getAddress', () => {
    it('matches an example', () => {
      const result = Pool.getAddress(USDT0, USDe, FeeAmount.LOW)
      expect(result).toEqual('0x27C51Ae6C3BCCfa0d7E11De0BFEC80a1c297A8eC')
    })
  })

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      let pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
      expect(pool.token0).toEqual(USDe)
      pool = new Pool(USDe, USDT0, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
      expect(pool.token0).toEqual(USDe)
    })
  })
  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      let pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
      expect(pool.token1).toEqual(USDT0)
      pool = new Pool(USDe, USDT0, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
      expect(pool.token1).toEqual(USDT0)
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(
        new Pool(
          USDT0,
          USDe,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          []
        ).token0Price.toSignificant(5)
      ).toEqual('1.01')
      expect(
        new Pool(
          USDe,
          USDT0,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          []
        ).token0Price.toSignificant(5)
      ).toEqual('1.01')
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(
        new Pool(
          USDT0,
          USDe,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          []
        ).token1Price.toSignificant(5)
      ).toEqual('0.9901')
      expect(
        new Pool(
          USDe,
          USDT0,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          []
        ).token1Price.toSignificant(5)
      ).toEqual('0.9901')
    })
  })

  describe('#priceOf', () => {
    const pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
    it('returns price of token in terms of other token', () => {
      expect(pool.priceOf(USDe)).toEqual(pool.token0Price)
      expect(pool.priceOf(USDT0)).toEqual(pool.token1Price)
    })

    it('throws if invalid token', () => {
      expect(() => pool.priceOf(WETH9[9745])).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      let pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
      expect(pool.chainId).toEqual(9745)
      pool = new Pool(USDe, USDT0, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
      expect(pool.chainId).toEqual(9745)
    })
  })

  describe('#involvesToken', () => {
    const pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
    expect(pool.involvesToken(USDT0)).toEqual(true)
    expect(pool.involvesToken(USDe)).toEqual(true)
    expect(pool.involvesToken(WETH9[9745])).toEqual(false)
  })

  describe('swaps', () => {
    let pool: Pool

    beforeEach(() => {
      pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), ONE_ETHER, 0, [
        {
          index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[FeeAmount.LOW]),
          liquidityNet: ONE_ETHER,
          liquidityGross: ONE_ETHER
        },
        {
          index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[FeeAmount.LOW]),
          liquidityNet: JSBI.multiply(ONE_ETHER, NEGATIVE_ONE),
          liquidityGross: ONE_ETHER
        }
      ])
    })

    describe('#getOutputAmount', () => {
      it('USDT0 -> USDe', async () => {
        const inputAmount = CurrencyAmount.fromRawAmount(USDT0, 100)
        const [outputAmount] = await pool.getOutputAmount(inputAmount)
        expect(outputAmount.currency.equals(USDe)).toBe(true)
        expect(outputAmount.quotient).toEqual(JSBI.BigInt(98))
      })

      it('USDe -> USDT0', async () => {
        const inputAmount = CurrencyAmount.fromRawAmount(USDe, 100)
        const [outputAmount] = await pool.getOutputAmount(inputAmount)
        expect(outputAmount.currency.equals(USDT0)).toBe(true)
        expect(outputAmount.quotient).toEqual(JSBI.BigInt(98))
      })
    })

    describe('#getInputAmount', () => {
      it('USDT0 -> USDe', async () => {
        const outputAmount = CurrencyAmount.fromRawAmount(USDe, 98)
        const [inputAmount] = await pool.getInputAmount(outputAmount)
        expect(inputAmount.currency.equals(USDT0)).toBe(true)
        expect(inputAmount.quotient).toEqual(JSBI.BigInt(100))
      })

      it('USDe -> USDT0', async () => {
        const outputAmount = CurrencyAmount.fromRawAmount(USDT0, 98)
        const [inputAmount] = await pool.getInputAmount(outputAmount)
        expect(inputAmount.currency.equals(USDe)).toBe(true)
        expect(inputAmount.quotient).toEqual(JSBI.BigInt(100))
      })
    })
  })

  describe('#bigNums', () => {
    let pool: Pool
    const bigNum1 = JSBI.add(JSBI.BigInt(Number.MAX_SAFE_INTEGER), JSBI.BigInt(1))
    const bigNum2 = JSBI.add(JSBI.BigInt(Number.MAX_SAFE_INTEGER), JSBI.BigInt(1))
    beforeEach(() => {
      pool = new Pool(USDT0, USDe, FeeAmount.LOW, encodeSqrtRatioX96(bigNum1, bigNum2), ONE_ETHER, 0, [
        {
          index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[FeeAmount.LOW]),
          liquidityNet: ONE_ETHER,
          liquidityGross: ONE_ETHER
        },
        {
          index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[FeeAmount.LOW]),
          liquidityNet: JSBI.multiply(ONE_ETHER, NEGATIVE_ONE),
          liquidityGross: ONE_ETHER
        }
      ])
    })

    describe('#priceLimit', () => {
      it('correctly compares two BigIntegers', async () => {
        expect(bigNum1).toEqual(bigNum2)
      })
      it('correctly handles two BigIntegers', async () => {
        const inputAmount = CurrencyAmount.fromRawAmount(USDT0, 100)
        const [outputAmount] = await pool.getOutputAmount(inputAmount)
        pool.getInputAmount(outputAmount)
        expect(outputAmount.currency.equals(USDe)).toBe(true)
        // if output is correct, function has succeeded
      })
    })
  })
})
