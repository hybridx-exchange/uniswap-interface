import { Currency, ETHER, Token } from 'oasis-uniswap-v2-sdk'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'OETH'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
