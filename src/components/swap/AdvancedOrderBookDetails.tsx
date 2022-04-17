import { TradeRet } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'

function TradeSummary({ tradeRet, allowedSlippage }: { tradeRet: TradeRet; allowedSlippage: number }) {
  const theme = useContext(ThemeContext)

  return (
    <>
      <AutoColumn style={{ padding: '0 20px' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Amm amount in/out'}
            </TYPE.black>
            <QuestionHelper text="Input and output in the liquidity pool." />
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

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Order amount in/out'}
            </TYPE.black>
            <QuestionHelper text="Input and output in the order book." />
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

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Amount left/expert'}
            </TYPE.black>
            <QuestionHelper text="Left and expect amount after the trade." />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text1}>
            <TYPE.black color={theme.text1} fontSize={14}>
              {tradeRet?.amountLeft.toSignificant() +
                ' ' +
                tradeRet?.amountLeft.currency.symbol +
                '/' +
                tradeRet?.amountExpect.toSignificant() +
                ' ' +
                tradeRet?.amountExpect.currency.symbol}
            </TYPE.black>
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AdvancedOrderBookDetailsProps {
  tradeRet?: TradeRet
}

export function AdvancedOrderBookDetails({ tradeRet }: AdvancedOrderBookDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()
  return (
    <AutoColumn gap="md">
      {tradeRet && (
        <>
          <TradeSummary tradeRet={tradeRet} allowedSlippage={allowedSlippage} />
        </>
      )}
    </AutoColumn>
  )
}
