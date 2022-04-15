import { Trade, TradeType } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

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
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={14} color={theme.text2}>
            Price
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
            {trade.price.toSignificant() + ' ' + trade.price.currency}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {trade.tradeType === TradeType.LIMIT_BUY ? trade.tradeRet : 'Sell'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>{trade.tradeType === TradeType.LIMIT_BUY ? 'buy' : 'sell'}</TYPE.black>
            <TYPE.black fontSize={14} marginLeft={'4px'}>
              {trade.tradeType === TradeType.LIMIT_BUY ? trade.quoteToken.symbol : trade.baseToken?.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black fontSize={14}>{trade.amount.toSignificant(6) + ' ' + trade.amount.currency.symbol}</TYPE.black>
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
