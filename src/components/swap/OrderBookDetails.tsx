import { Token, OrderBook } from '@hybridx-exchange/uniswap-sdk'
import React from 'react'
import { StyledInternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { Text } from 'rebass'
import { Field } from '../../state/swap/actions'

export interface OrderBookDetailsProps {
  orderBook?: OrderBook
  wrappedCurrencies: { [field in Field]?: Token }
}

export function OrderBookDetails({ orderBook, wrappedCurrencies }: OrderBookDetailsProps) {
  return (
    <AutoColumn gap="md">
      {orderBook && (
        <>
          <div>
            <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
              {'Want to use limit orders?'}{' '}
              <StyledInternalLink
                id="create-limit-order"
                to={
                  '/trade/' + wrappedCurrencies[Field.INPUT]?.address + '/' + wrappedCurrencies[Field.OUTPUT]?.address
                }
              >
                {'New Limit Order'}
              </StyledInternalLink>
            </Text>
          </div>
        </>
      )}
      {!orderBook && wrappedCurrencies[Field.INPUT]?.address !== wrappedCurrencies[Field.OUTPUT]?.address && (
        <>
          <div>
            <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
              {'Want to use limit orders?'}{' '}
              <StyledInternalLink
                id="create-order-book"
                to={
                  '/orderbook/' +
                  wrappedCurrencies[Field.INPUT]?.address +
                  '/' +
                  wrappedCurrencies[Field.OUTPUT]?.address
                }
              >
                {'Create order book for this pair.'}
              </StyledInternalLink>
            </Text>
          </div>
        </>
      )}
    </AutoColumn>
  )
}
