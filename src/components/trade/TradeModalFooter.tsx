import { Trade, TradeType } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { SwapCallbackError } from './styleds'

export default function TradeModalFooter({
  trade,
  onConfirm,
  tradeErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  onConfirm: () => void
  tradeErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const theme = useContext(ThemeContext)

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={14} color={theme.text2}>
            {'Amm amount in/out'}
            <QuestionHelper text="Input and output in the liquidity pool." />
          </Text>
          <Text
            fontWeight={500}
            fontSize={14}
            color={theme.text1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px'
            }}
          >
            {trade?.tradeRet?.ammAmountIn.toSignificant() +
              ' ' +
              trade?.tradeRet?.ammAmountIn.currency.symbol +
              '/' +
              trade?.tradeRet?.ammAmountOut.toSignificant() +
              ' ' +
              trade?.tradeRet?.ammAmountOut.currency.symbol}
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {'Order amount in/out'}
            </TYPE.black>
            <QuestionHelper text="Input and output in the order book." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>
              {trade?.tradeRet?.orderAmountIn.toSignificant() +
                ' ' +
                trade?.tradeRet?.orderAmountIn.currency.symbol +
                '/' +
                trade?.tradeRet?.orderAmountOut.toSignificant() +
                ' ' +
                trade?.tradeRet?.orderAmountOut.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              {'Amount left/expert'}
            </TYPE.black>
            <QuestionHelper text="Left and expect amount after the trade." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>
              {trade?.tradeRet?.amountLeft.toSignificant() +
                ' ' +
                trade?.tradeRet?.amountLeft.currency.symbol +
                '/' +
                trade?.tradeRet?.amountExpect.toSignificant() +
                ' ' +
                trade?.tradeRet?.amountExpect.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={false}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-trade-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            {trade.tradeType === TradeType.LIMIT_BUY ? 'Buy' : 'Sell'}
          </Text>
        </ButtonError>

        {tradeErrorMessage ? <SwapCallbackError error={tradeErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
