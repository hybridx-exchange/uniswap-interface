import React, { useContext, useMemo } from 'react'
import { ThemeContext } from 'styled-components'
import { OrderBook } from '@hybridx-exchange/uniswap-sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import Question from '../../components/QuestionHelper'
import { StyledInternalLink, TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { useTrackedTokenPairs } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { useUserOrderIds, useUserOrders } from '../../hooks/Trades'
import FullOrderCard from '../../components/OrderCard'

export default function DoUserOrder() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

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
  console.log('userOrders:', userOrders)

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'pool'} />
        <AutoColumn gap="lg" justify="center">
          <ButtonPrimary id="create-order-button" as={Link} style={{ padding: 16 }} to="/trade/ROSE">
            <Text fontWeight={500} fontSize={20}>
              New Order
            </Text>
          </ButtonPrimary>

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
                  <FullOrderCard key={order.orderId.toString()} order={order} />
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
                <StyledInternalLink id="import-pool-link" to={'/find'}>
                  {'Import it.'}
                </StyledInternalLink>
              </Text>
            </div>
          </AutoColumn>
        </AutoColumn>
      </AppBody>
    </>
  )
}
