import { Currency, CurrencyAmount, JSBI, OrderBook, Pair } from '@hybridx-exchange/uniswap-sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PairState, usePair } from '../../data/Reserves'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import { Field, orderBookTypeInput } from './actions'
import { useOrderBook } from '../../hooks/Trades'

const ZERO = JSBI.BigInt(0)

export function useOrderBookState(): AppState['orderBook'] {
  return useSelector<AppState, AppState['orderBook']>(state => state.orderBook)
}

export function useDerivedOrderBookInfo(
  currencyBase: Currency | undefined,
  currencyQuote: Currency | undefined
): {
  currencies: { [field in Field]?: Currency }
  pair?: Pair | null
  pairState: PairState
  orderBook?: OrderBook | null
  priceStepAmount: CurrencyAmount | undefined
  minAmountAmount: CurrencyAmount | undefined
  noLiquidity?: boolean
  error?: string
} {
  const { account } = useActiveWeb3React()

  const { priceStepValue, minAmountValue } = useOrderBookState()

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_BASE]: currencyBase ?? undefined,
      [Field.CURRENCY_QUOTE]: currencyQuote ?? undefined
    }),
    [currencyBase, currencyQuote]
  )

  // pair
  const [pairState, pair] = usePair(currencies[Field.CURRENCY_BASE], currencies[Field.CURRENCY_QUOTE])
  const totalSupply = useTotalSupply(pair?.liquidityToken)

  const noLiquidity: boolean =
    pairState === PairState.NOT_EXISTS || Boolean(totalSupply && JSBI.equal(totalSupply.raw, ZERO))

  // amounts
  const priceStepAmount: CurrencyAmount | undefined = tryParseAmount(priceStepValue, currencies[Field.CURRENCY_QUOTE])
  const minAmountAmount: CurrencyAmount | undefined = tryParseAmount(minAmountValue, currencies[Field.CURRENCY_BASE])

  const orderBook = useOrderBook(
    currencies[Field.CURRENCY_BASE] ?? undefined,
    currencies[Field.CURRENCY_QUOTE] ?? undefined
  )

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (pairState === PairState.INVALID) {
    error = error ?? 'Invalid pair'
  }

  if (pairState === PairState.NOT_EXISTS) {
    error = error ?? 'Create pair first'
  }

  if (!orderBook && !priceStepAmount) {
    error = error ?? 'Enter price step for order book'
  }

  if (!orderBook && !minAmountAmount) {
    error = error ?? 'Enter minimum amount for order'
  }

  if (orderBook && !priceStepAmount && !minAmountAmount) {
    error = error ?? 'Enter the parameter value'
  }

  return {
    currencies,
    pair,
    pairState,
    orderBook,
    priceStepAmount,
    minAmountAmount,
    noLiquidity,
    error
  }
}

export function useOrderBookActionHandlers(
  noLiquidity: boolean | undefined,
  orderBookExist: boolean | undefined
): {
  onFieldBaseInput: (typedValue: string) => void
  onFieldQuoteInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldBaseInput = useCallback(
    (typedValue: string) => {
      dispatch(
        orderBookTypeInput({
          field: Field.CURRENCY_BASE,
          typedValue,
          noLiquidity: noLiquidity === true,
          orderBookExist: orderBookExist === false
        })
      )
    },
    [dispatch, noLiquidity, orderBookExist]
  )
  const onFieldQuoteInput = useCallback(
    (typedValue: string) => {
      dispatch(
        orderBookTypeInput({
          field: Field.CURRENCY_QUOTE,
          typedValue,
          noLiquidity: noLiquidity === true,
          orderBookExist: orderBookExist === false
        })
      )
    },
    [dispatch, noLiquidity, orderBookExist]
  )

  return {
    onFieldBaseInput,
    onFieldQuoteInput
  }
}
