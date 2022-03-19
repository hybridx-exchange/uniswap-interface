import { Currency, CurrencyAmount, Fraction } from '@hybridx-exchange/uniswap-sdk'
import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/orderBook/actions'
import { TYPE } from '../../theme'

export function ConfirmCreateModalBottom({
  noLiquidity,
  price,
  currencies,
  priceStepAmount,
  minAmountAmount,
  onAdd
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  priceStepAmount: CurrencyAmount | undefined
  minAmountAmount: CurrencyAmount | undefined
  onAdd: () => void
}) {
  return (
    <>
      <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_BASE]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_BASE]} style={{ marginRight: '8px' }} />
          <TYPE.body>{minAmountAmount?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_QUOTE]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_QUOTE]} style={{ marginRight: '8px' }} />
          <TYPE.body>{priceStepAmount?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.body>Rates</TYPE.body>
        <TYPE.body>
          {`1 ${currencies[Field.CURRENCY_BASE]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_QUOTE]?.symbol
          }`}
        </TYPE.body>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <TYPE.body>
          {`1 ${currencies[Field.CURRENCY_QUOTE]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_BASE]?.symbol
          }`}
        </TYPE.body>
      </RowBetween>
      <RowBetween>
        <TYPE.body>Share of Pool:</TYPE.body>
        <TYPE.body>{noLiquidity ? '100' : '200'}%</TYPE.body>
      </RowBetween>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={20}>
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
        </Text>
      </ButtonPrimary>
    </>
  )
}
