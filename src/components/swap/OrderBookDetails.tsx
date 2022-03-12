import { OrderBook } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import { SectionBreak } from './styleds'

function OrderBookSummary({ orderBook }: { orderBook: OrderBook }) {
  const theme = useContext(ThemeContext)

  return (
    <>
      <AutoColumn style={{ padding: '0 20px' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Current price'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {orderBook.curPrice.toExact()}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Sell order size:
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {orderBook.sellOrders.length}
            </TYPE.black>
          </RowFixed>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Buy Order size:
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text1}>
            {orderBook.buyOrders.length}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface OrderBookDetailsProps {
  orderBook?: OrderBook
}

export function OrderBookDetails({ orderBook }: OrderBookDetailsProps) {
  const theme = useContext(ThemeContext)

  const showPrice = Boolean(orderBook && orderBook.curPrice)

  return (
    <AutoColumn gap="md">
      {orderBook && (
        <>
          <OrderBookSummary orderBook={orderBook} />
          {showPrice && (
            <>
              <SectionBreak />
              <AutoColumn style={{ padding: '0 24px' }}>
                <RowFixed>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    Reserves
                  </TYPE.black>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </RowFixed>
                <TYPE.black fontSize={14} color={theme.text1}>
                  {orderBook.baseToken.toExact()}-{orderBook.quoteToken.toExact()}
                </TYPE.black>
              </AutoColumn>
            </>
          )}
        </>
      )}
    </AutoColumn>
  )
}
