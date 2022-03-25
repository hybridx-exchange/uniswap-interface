import { OrderBook } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { TYPE } from '../../theme'
import QuestionHelper from '../QuestionHelper'
import { AutoColumn } from '../Column'

const Wrapper = styled.div<{ show: boolean }>`
  position: relative;
  background-color: #ffffff;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 10px 10px 1px rgba(0, 0, 0, 0.2), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 30px;
  padding: 1rem;
  display: ${({ show }) => (show ? 'block' : 'none')};
`

const Title = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: 600;
  justify-content: space-between;
  margin-top: 20px;
`

const Left = styled.div`
  width: 50%;
  color: #2ab66a;
  border-bottom: 4px solid #2ab66a;
  padding-bottom: 5px;
  padding-left: 5px;
`

const Right = styled.div`
  width: 50%;
  color: #ed5577;
  text-align: right;
  border-bottom: 4px solid #ed5577;
  padding-bottom: 5px;
  padding-right: 5px;
`

const Table = styled.table`
  font-size: 16px;
  width: 100%;
`

const Tr = styled.tr`
  display: flex;
`

const Th = styled.th`
  flex: 1;
  font-weight: normal;
  padding: 16px 0;
`

const Td = styled.td`
  flex: 1;
  text-align: center;
  padding: 8px 0;
`

interface OrderBookTableProps {
  thData: any[]
  orderBook?: OrderBook
}

export function OrderBookTable({ thData, orderBook }: OrderBookTableProps) {
  const show = Boolean(orderBook)
  const buyData = orderBook?.buyOrders ?? [],
    sellData = orderBook?.sellOrders ?? []

  const buyOrdersLength = buyData.length
  const sellOrdersLength = sellData.length
  const tb: any[] = []
  const symbol = orderBook?.quoteToken.currency.symbol ?? ''
  console.log('symbol', symbol)
  let row: string[] = []
  if (buyOrdersLength > 0) {
    buyData.forEach((v, i) => {
      row = []
      row[0] = v?.amount ? v.amount.toSignificant(4) + ' ' + v?.amount?.currency.symbol : ''
      row[1] = v?.price ? v.price.toSignificant(4) + ' ' + v?.price?.currency.symbol : ''
      row[2] = sellData[i]?.price ? sellData[i].price.toSignificant(4) + ' ' + sellData[i]?.price.currency.symbol : ''
      row[3] = sellData[i]?.amount
        ? sellData[i].amount.toSignificant(4) + ' ' + sellData[i]?.amount.currency.symbol
        : ''
      tb[i] = row
    })
  } else if (sellOrdersLength > 0) {
    sellData.forEach((v, i) => {
      row = []
      row[0] = buyData[i]?.amount ? buyData[i].amount.toSignificant(4) + ' ' + buyData[i]?.amount.currency.symbol : ''
      row[1] = buyData[i]?.price ? buyData[i].amount.toSignificant(4) + ' ' + buyData[i]?.price.currency.symbol : ''
      row[2] = v?.price ? v.price.toSignificant(4) + ' ' + v?.price?.currency.symbol : ''
      row[3] = v?.amount ? v.amount.toSignificant(4) + ' ' + v?.amount?.currency.symbol : ''
      tb[i] = row
    })
    console.log('tb', tb)
  }
  const theme = useContext(ThemeContext)
  return (
    <Wrapper show={show}>
      <RowBetween>
        <RowFixed>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            {'Current price'}
          </TYPE.black>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </RowFixed>
        <RowFixed>
          <TYPE.black color={theme.text1} fontSize={14}>
            {orderBook?.curPrice.toExact() + ' ' + symbol}
          </TYPE.black>
        </RowFixed>
      </RowBetween>
      <AutoColumn style={{ padding: '0 24px' }}>
        <RowFixed>
          <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
            Reserves
          </TYPE.black>
          <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
        </RowFixed>
        <TYPE.black fontSize={14} color={theme.text1}>
          {orderBook?.baseToken.toSignificant(4)}-{orderBook?.quoteToken.toSignificant(4)}
        </TYPE.black>
      </AutoColumn>
      <Title>
        <Left>买</Left>
        <Right>卖</Right>
      </Title>
      <Table>
        <Tr>
          {thData.map((v, i) => {
            return <Th key={i}>{v}</Th>
          })}
        </Tr>
        {tb.map((v: React.ReactNode[], i: string | number | undefined) => {
          return (
            <Tr key={i}>
              {v.map((y: React.ReactNode, j: string | number | undefined) => {
                return <Td key={j}>{y}</Td>
              })}
            </Tr>
          )
        })}
      </Table>
    </Wrapper>
  )
}
