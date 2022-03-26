import React from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { OrderBookDetails, OrderBookDetailsProps } from './OrderBookDetails'
import { Field } from '../../state/swap/actions'

const OrderBookDetailsFooter = styled.div<{ show: boolean }>`
  padding: 20px 0;
  width: 100%;
  color: ${({ theme }) => theme.text2};
  display: ${({ show }) => (show ? 'block' : 'none')};
`

export default function OrderBookTip({ orderBook, wrappedCurrencies, ...rest }: OrderBookDetailsProps) {
  const lastOrderBook = useLastTruthy(orderBook)
  const show =
    Boolean(orderBook) ||
    (wrappedCurrencies[Field.INPUT] !== undefined &&
      wrappedCurrencies[Field.OUTPUT] !== undefined &&
      wrappedCurrencies[Field.INPUT] !== wrappedCurrencies[Field.OUTPUT])
  return (
    <OrderBookDetailsFooter show={show}>
      <OrderBookDetails
        {...rest}
        orderBook={orderBook ?? lastOrderBook ?? undefined}
        wrappedCurrencies={wrappedCurrencies}
      />
    </OrderBookDetailsFooter>
  )
}
