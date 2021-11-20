import { Currency, ETHER, Token } from 'emerald-uniswap-sdk'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ROSE'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
