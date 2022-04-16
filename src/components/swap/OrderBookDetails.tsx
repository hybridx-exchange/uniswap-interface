import { Token, OrderBook, Currency } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import { StyledInternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { Text } from 'rebass'
import { Field } from '../../state/swap/actions'
import { RowBetween } from '../Row'
import { ClickableText } from '../../pages/Pool/styleds'
import { ThemeContext } from 'styled-components'

export interface OrderBookDetailsProps {
  orderBook?: OrderBook
  currencies: { [field in Field]?: Currency }
}

export function OrderBookDetails({ orderBook, currencies }: OrderBookDetailsProps) {
  const theme = useContext(ThemeContext)

  const currencyAAddress =
    currencies[Field.INPUT] instanceof Token
      ? (currencies[Field.INPUT] as Token).address
      : currencies[Field.INPUT]?.symbol
  const currencyBAddress =
    currencies[Field.OUTPUT] instanceof Token
      ? (currencies[Field.OUTPUT] as Token).address
      : currencies[Field.OUTPUT]?.symbol
  return (
    <AutoColumn gap="md">
      {!orderBook && currencyAAddress !== currencyBAddress && (
        <>
          <div>
            <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
              {'Want to use limit orders?'}{' '}
              <StyledInternalLink id="create-order-book" to={'/orderbook/' + currencyAAddress + '/' + currencyBAddress}>
                {'Create order book for this pair.'}
              </StyledInternalLink>
            </Text>
          </div>
        </>
      )}
      {orderBook &&
        orderBook.buyOrders.length === 0 &&
        orderBook.sellOrders.length === 0 &&
        currencyAAddress !== currencyBAddress && (
          <div>
            <RowBetween align="center" style={{ padding: '10px 20px' }}>
              <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                Min Amount
              </ClickableText>
              <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                {orderBook.minAmount.toString()}
              </ClickableText>
            </RowBetween>
            <RowBetween align="center" style={{ padding: '10px 20px' }}>
              <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                Price Step
              </ClickableText>
              <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                {orderBook.priceStep.toString()}
              </ClickableText>
            </RowBetween>
            <RowBetween align="center" style={{ padding: '10px 20px' }}>
              <ClickableText fontSize={14} color={theme.text2}>
                Fee Rate
              </ClickableText>
              <ClickableText fontSize={14} color={theme.text2}>
                {orderBook.protocolFeeRate.toString()}
              </ClickableText>
            </RowBetween>
            <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
              {'Want to use limit orders?'}{' '}
              <StyledInternalLink id="create-order-book" to={'/orderbook/' + currencyAAddress + '/' + currencyBAddress}>
                {'edit order book for this pair.'}
              </StyledInternalLink>
            </Text>
          </div>
        )}
    </AutoColumn>
  )
}
