export const FACTORY_ADDRESS = '0xa899b9F40c484Dbb02D7F81B90654A24730c0255'
export const FACTORY_ADDRESS_ZKSYS = '0xC701afF2302f2461faE33ec5978495FB80884837'
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const POOL_INIT_CODE_HASH = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

export const POOL_INIT_CODE_HASH_MAP: { [chainId: number]: string } = {
  9745: POOL_INIT_CODE_HASH,
  57000: POOL_INIT_CODE_HASH,
  5701: '0x010013f1775c5d6840f6191dd3fcb1b0576d8a149687d32a63c222521394af32'
}


/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200
}
