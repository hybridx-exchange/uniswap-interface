import React from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { OrderBookDetails, OrderBookDetailsProps } from './OrderBookDetails'
import { Field } from '../../state/swap/actions'

const OrderBookDetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 20px;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};
  z-index: -1;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

export default function OrderBookDetailsDropdown({ orderBook, wrappedCurrencies, ...rest }: OrderBookDetailsProps) {
  const lastOrderBook = useLastTruthy(orderBook)
  console.log(wrappedCurrencies)
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
