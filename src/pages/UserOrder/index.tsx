import React, { useCallback, useContext, useMemo, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Currency, ETHER, OrderBook } from '@hybridx-exchange/uniswap-sdk'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import Question from '../../components/QuestionHelper'
import { LinkStyledButton, TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { useTrackedTokenPairs } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { useUserOrderIds, useUserOrders } from '../../hooks/Trades'
import FullOrderCard from '../../components/OrderCard'
import CurrencySelectPanel from '../../components/CurrencySelectPanel'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { currencyId } from '../../utils/currencyId'

const CurrencyInputDiv = styled.div`
  display: flex;
  justify-content: space-between;
`

export default function DoUserOrder() {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const [onImport, setOnImport] = useState<boolean>(false)

  const [currencyA, setCurrencyA] = useState<Currency | null>(ETHER)
  const [currencyB, setCurrencyB] = useState<Currency | null>(null)

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const trackedTokenPairsAndOrderBookAddresses = useMemo(
    () => trackedTokenPairs.map(tokens => [tokens[0], tokens[1], OrderBook.getAddress(tokens[0], tokens[1])]),
    [trackedTokenPairs]
  )

  const { selectOrderBooks, userOrderIds } = useUserOrderIds(
    account ?? undefined,
    trackedTokenPairsAndOrderBookAddresses
  )
  //console.log('selectOrderBooks:', selectOrderBooks, 'userOrderIds:', userOrderIds)
  const userOrders = useUserOrders(selectOrderBooks, userOrderIds)

  const handleTokenASelect = useCallback(
    (currency: Currency) => {
      const currencyWRose = wrappedCurrency(ETHER, chainId)
      const newCurrencyIdA = currencyId(currency)
      const currencyIdB = currencyB ? currencyId(currencyB) : ''
      if (
        newCurrencyIdA === currencyIdB ||
        (newCurrencyIdA === ETHER.symbol && currencyB === currencyWRose) ||
        (newCurrencyIdA === currencyWRose?.address && currencyIdB === ETHER.symbol)
      ) {
        setCurrencyA(currencyB)
        setCurrencyB(currencyA)
      } else {
        setCurrencyA(currency)
      }
    },
    [currencyA, currencyB, chainId]
  )

  const handleTokenBSelect = useCallback(
    (currency: Currency) => {
      const currencyWRose = wrappedCurrency(ETHER, chainId)
      const newCurrencyIdB = currencyId(currency)
      const currencyIdA = currencyA ? currencyId(currencyA) : ''
      if (
        newCurrencyIdB === currencyIdA ||
        (newCurrencyIdB === ETHER.symbol && currencyA === currencyWRose) ||
        (newCurrencyIdB === currencyWRose?.address && currencyIdA === ETHER.symbol)
      ) {
        setCurrencyB(currencyA)
        setCurrencyA(currencyB)
      } else {
        setCurrencyB(currency)
      }
    },
    [currencyA, currencyB, chainId]
  )

  if (currencyA && currencyB) {
    const tokenA = wrappedCurrency(currencyA, chainId)
    const tokenB = wrappedCurrency(currencyB, chainId)
    if (tokenA && tokenB) {
      let has = false

      trackedTokenPairs.forEach(base => {
        if (
          (tokenA.address === base[0].address && tokenB.address === base[1].address) ||
          (tokenB.address === base[0].address && tokenA.address === base[1].address)
        ) {
          has = true
          return
        }
      })

      if (!has) {
        trackedTokenPairs.push([tokenA, tokenB])
      }
    }
  }

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'order'} />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="12px" style={{ width: '100%' }}>
            <RowBetween padding={'0 8px'}>
              <Text color={theme.text1} fontWeight={500}>
                Your Orders
              </Text>
              <Question text="Orders related to tokens in your watchlist will be displayed here. If you don’t see your orders in this list, try importing a token pair below." />
            </RowBetween>

            {!account ? (
              <LightCard padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  Connect to a wallet to view your orders.
                </TYPE.body>
              </LightCard>
            ) : userOrders.length > 0 ? (
              <>
                {userOrders.map(order => (
                  <FullOrderCard
                    key={order.baseToken.address + '-' + order.quoteToken.address + '-' + order.orderId.toString()}
                    order={order}
                  />
                ))}
              </>
            ) : (
              <LightCard padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  No orders found.
                </TYPE.body>
              </LightCard>
            )}

            <div>
              <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                {"Don't see your orders?"}{' '}
                <LinkStyledButton
                  id="import-pool-link"
                  onClick={() => {
                    setOnImport(!onImport)
                  }}
                >
                  {'Import it.'}
                </LinkStyledButton>
              </Text>
            </div>

            {onImport && (
              <CurrencyInputDiv>
                <CurrencySelectPanel
                  label={'TokenA'}
                  currency={currencyA}
                  onCurrencySelect={handleTokenASelect}
                  otherCurrency={currencyB}
                  id="order-pair-from-token"
                  showCommonBases
                />
                <CurrencySelectPanel
                  label={'TokenB'}
                  currency={currencyB}
                  onCurrencySelect={handleTokenBSelect}
                  otherCurrency={currencyA}
                  id="order-pair-to-token"
                  showCommonBases
                />
              </CurrencyInputDiv>
            )}
          </AutoColumn>
        </AutoColumn>
      </AppBody>
    </>
  )
}
