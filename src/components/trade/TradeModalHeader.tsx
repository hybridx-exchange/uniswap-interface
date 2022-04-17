import { Trade, TradeType } from '@hybridx-exchange/uniswap-sdk'
import React, { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'

export default function TradeModalHeader({
  trade,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
      <RowBetween align="flex-end">
        <RowFixed>
          <TruncatedText size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }}>
            {trade.tradeType === TradeType.LIMIT_BUY
              ? 'Buy ' + trade.baseToken.symbol + ' amount of '
              : 'Sell amount of '}
          </TruncatedText>
        </RowFixed>
        <RowFixed gap={'0px'}>
          <TruncatedText fontSize={24} fontWeight={500} color={showAcceptChanges ? theme.primary1 : ''}>
            {trade.amount.toSignificant(6) + ' ' + trade.amount.currency.symbol}
          </TruncatedText>
        </RowFixed>
      </RowBetween>

      <RowBetween align="flex-end">
        <RowFixed>
          <TruncatedText fontSize={16} color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }}>
            {'At price of'}
          </TruncatedText>
        </RowFixed>
        <RowFixed gap={'0px'}>
          <TruncatedText fontSize={24} fontWeight={500} color={showAcceptChanges ? theme.primary1 : ''}>
            {trade.price.toSignificant(6) + ' ' + trade.price.currency.symbol}
          </TruncatedText>
        </RowFixed>
      </RowBetween>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Trade Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.LIMIT_BUY ? (
          <TYPE.italic textAlign="left" style={{ width: '100%' }}>
            {`You will received at least `}
            <b>
              {trade.tradeRet.ammAmountOut.add(trade.tradeRet.orderAmountOut).toSignificant()} {trade.baseToken.symbol}
              {' immediately. '}
            </b>
            {!trade.tradeRet.amountLeft.equalTo('0') &&
              trade.tradeRet.amountLeft.toSignificant() +
                ' ' +
                trade.baseToken.symbol +
                ' will be place on the order book at price of ' +
                trade.price.toSignificant() +
                ' ' +
                trade.price.currency.symbol}
          </TYPE.italic>
        ) : (
          <TYPE.italic textAlign="left" style={{ width: '100%' }}>
            {`You will received at most `}
            <b>
              {trade.tradeRet.ammAmountOut.add(trade.tradeRet.orderAmountOut).toSignificant()} {trade.quoteToken.symbol}
              {' immediately. '}
            </b>
            {!trade.tradeRet.amountLeft.equalTo('0') &&
              trade.tradeRet.amountLeft.toSignificant() +
                ' ' +
                trade.baseToken.symbol +
                ' will be place on the order book at price of ' +
                trade.price.toSignificant() +
                ' ' +
                trade.price.currency.symbol}
          </TYPE.italic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
