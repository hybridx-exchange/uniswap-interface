import { TradeRet } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { TYPE } from '../../theme'
import QuestionHelper from '../QuestionHelper'

const Wrapper = styled.div<{ show: boolean }>`
  margin: 10px;
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

interface RradeRetInfoProps {
  tradeRet?: TradeRet
}

export function TradeTradeRet({ tradeRet }: RradeRetInfoProps) {
  const show = Boolean(tradeRet)
  const theme = useContext(ThemeContext)
  return (
    <Wrapper show={show}>
      {tradeRet?.ammAmountIn && (
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Amm amount in/out'}
            </TYPE.black>
            <QuestionHelper text="Input and output in the liquidity pool" />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {tradeRet?.ammAmountIn.toSignificant() +
                ' ' +
                tradeRet?.ammAmountIn.currency.symbol +
                '/' +
                tradeRet?.ammAmountOut.toSignificant() +
                ' ' +
                tradeRet?.ammAmountOut.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
      )}
      {tradeRet?.orderAmountIn && (
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Order amount in/out'}
            </TYPE.black>
            <QuestionHelper text="Input and output in the order book" />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {tradeRet?.orderAmountIn.toSignificant() +
                ' ' +
                tradeRet?.orderAmountIn.currency.symbol +
                '/' +
                tradeRet?.orderAmountOut.toSignificant() +
                ' ' +
                tradeRet?.orderAmountOut.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
      )}
      {tradeRet?.amountLeft && (
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Amount left/expert'}
            </TYPE.black>
            <QuestionHelper text="Left and expect amount after the trade" />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {tradeRet?.amountLeft.toSignificant() +
                ' ' +
                tradeRet?.amountLeft.currency.symbol +
                '/' +
                tradeRet?.amountExpect.toSignificant() +
                ' ' +
                tradeRet?.amountExpect.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
      )}
      {tradeRet?.priceTo && (
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Price'}
            </TYPE.black>
            <QuestionHelper text="The prices before and after the trade" />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {tradeRet.orderBook.curPrice.toSignificant() +
                ' ' +
                tradeRet.orderBook.curPrice.currency.symbol +
                ' -> ' +
                tradeRet.priceTo.toSignificant() +
                ' ' +
                tradeRet.priceTo.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
      )}
    </Wrapper>
  )
}
