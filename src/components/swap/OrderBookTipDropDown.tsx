import React from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { OrderBookDetailsProps } from './OrderBookDetails'
import { Field } from '../../state/swap/actions'
import { Text } from 'rebass'
import { StyledInternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { Token } from '@hybridx-exchange/uniswap-sdk'

const OrderBookDetailsFooter = styled.div<{ show: boolean }>`
  padding: 20px 0;
  width: 100%;
  color: ${({ theme }) => theme.text2};
  display: ${({ show }) => (show ? 'block' : 'none')};
`

export default function OrderBookTipDropDown({ orderBook, currencies, ...rest }: OrderBookDetailsProps) {
  const lastOrderBook = useLastTruthy(orderBook)
  const show =
    Boolean(!orderBook) &&
    currencies[Field.INPUT] !== undefined &&
    currencies[Field.OUTPUT] !== undefined &&
    currencies[Field.INPUT] !== currencies[Field.OUTPUT]
  const currencyAAddress =
    currencies[Field.INPUT] instanceof Token
      ? (currencies[Field.INPUT] as Token).address
      : currencies[Field.INPUT]?.symbol
  const currencyBAddress =
    currencies[Field.OUTPUT] instanceof Token
      ? (currencies[Field.OUTPUT] as Token).address
      : currencies[Field.OUTPUT]?.symbol
  return (
    <OrderBookDetailsFooter show={show}>
      <AutoColumn gap="md">
        {!lastOrderBook && currencyAAddress !== currencyBAddress && (
          <>
            <div>
              <Text textAlign="right" fontSize={12} style={{ padding: '.5rem 0 .5rem 0' }}>
                {'Create order book'}{' '}
                <StyledInternalLink
                  id="create-order-book"
                  to={'/orderbook/' + currencyAAddress + '/' + currencyBAddress}
                >
                  {'->'}
                </StyledInternalLink>
              </Text>
            </div>
          </>
        )}
      </AutoColumn>
    </OrderBookDetailsFooter>
  )
}
