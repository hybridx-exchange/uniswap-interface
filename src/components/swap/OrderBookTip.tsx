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

export default function OrderBookTip({ orderBook, currencies, ...rest }: OrderBookDetailsProps) {
  const lastOrderBook = useLastTruthy(orderBook)
  const show =
    Boolean(orderBook) ||
    (currencies[Field.INPUT] !== undefined &&
      currencies[Field.OUTPUT] !== undefined &&
      currencies[Field.INPUT] !== currencies[Field.OUTPUT])
  return (
    <OrderBookDetailsFooter show={show}>
      <OrderBookDetails {...rest} orderBook={orderBook ?? lastOrderBook ?? undefined} currencies={currencies} />
    </OrderBookDetailsFooter>
  )
}
