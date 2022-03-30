import useENS from '../../hooks/useENS'
import { parseUnits } from '@ethersproject/units'
import {
  Currency,
  CurrencyAmount,
  ETHER,
  JSBI,
  OrderBook,
  Token,
  TokenAmount,
  TradeRet
} from '@hybridx-exchange/uniswap-sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useOrderBook, useTradeRet } from '../../hooks/Trades'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceTradeState, selectCurrency, setRecipient, switchCurrencies, Type, typeInput } from './actions'
import { TradeState } from './reducer'

export function useTradeState(): AppState['trade'] {
  return useSelector<AppState, AppState['trade']>(state => state.trade)
}

export function useTradeActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedAmountValue: string, typedPriceValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ROSE' : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedAmountValue: string, typedPriceValue: string) => {
      dispatch(typeInput({ field, typedAmountValue, typedPriceValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // v2 router 02
]

// from the current swap inputs, compute the best trade and return it.
export function useDerivedTradeInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmountAmount: CurrencyAmount | undefined
  parsedPriceAmount: CurrencyAmount | undefined
  orderBook: OrderBook | undefined
  tradeRet: TradeRet | undefined
  inputError?: string
} {
  const { account } = useActiveWeb3React()

  const {
    typedAmountValue,
    typedPriceValue,
    [Field.CURRENCY_A]: { currencyId: currencyAId },
    [Field.CURRENCY_B]: { currencyId: currencyBId },
    recipient
  } = useTradeState()

  const currencyA = useCurrency(currencyAId)
  const currencyB = useCurrency(currencyBId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    currencyA ?? undefined,
    currencyB ?? undefined
  ])

  const orderBook = useOrderBook(currencyA ?? undefined, currencyB ?? undefined)
  const type = orderBook?.baseToken.currency === currencyA ? Type.BUY : Type.SELL

  const currencyBalances = {
    [Field.CURRENCY_A]: relevantTokenBalances[0],
    [Field.CURRENCY_B]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.CURRENCY_A]: currencyA ?? undefined,
    [Field.CURRENCY_B]: currencyB ?? undefined
  }

  const parsedAmountAmount = tryParseAmount(
    typedAmountValue,
    type === Type.BUY ? orderBook?.quoteToken.currency : orderBook?.baseToken.currency
  )

  const parsedPriceAmount = tryParseAmount(typedPriceValue, orderBook?.quoteToken.currency)

  const tradeRet = useTradeRet(orderBook, type, parsedAmountAmount, parsedPriceAmount)

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!currencies[Field.CURRENCY_A] || !currencies[Field.CURRENCY_B]) {
    inputError = inputError ?? 'Select a token'
  }

  if (!parsedAmountAmount) {
    inputError = inputError ?? 'Enter the amount you want to ' + type === Type.BUY ? 'buy' : 'sell'
  }

  if (!parsedPriceAmount) {
    inputError = inputError ?? 'Enter the price you want to ' + type === Type.BUY ? 'buy' : 'sell'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [currencyBalances[Field.CURRENCY_A], parsedAmountAmount]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmountAmount,
    parsedPriceAmount,
    orderBook: orderBook ?? undefined,
    tradeRet: tradeRet ?? undefined,
    inputError
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ROSE') return 'ROSE'
    if (valid === false) return 'ROSE'
  }
  return 'ROSE'
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToTradeState(parsedQs: ParsedQs): TradeState {
  let currencyA = parseCurrencyFromURLParameter(parsedQs.currencyA)
  let currencyB = parseCurrencyFromURLParameter(parsedQs.currencyB)
  if (currencyA === currencyB) {
    if (typeof parsedQs.currencyB === 'string') {
      currencyA = ''
    } else {
      currencyB = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.CURRENCY_A]: {
      currencyId: currencyA
    },
    [Field.CURRENCY_B]: {
      currencyId: currencyB
    },
    typedAmountValue: parseTokenAmountURLParameter(parsedQs.exactAmountAmount),
    typedPriceValue: parseTokenAmountURLParameter(parsedQs.exactPriceAmount),
    recipient
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { currencyAId: string | undefined; currencyBId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { currencyAId: string | undefined; currencyBId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToTradeState(parsedQs)

    dispatch(
      replaceTradeState({
        typedAmountValue: parsed.typedAmountValue,
        typedPriceValue: parsed.typedPriceValue,
        currencyAId: parsed[Field.CURRENCY_A].currencyId,
        currencyBId: parsed[Field.CURRENCY_B].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ currencyAId: parsed[Field.CURRENCY_A].currencyId, currencyBId: parsed[Field.CURRENCY_B].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
