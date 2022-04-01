import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceTradeState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'

export interface TradeState {
  readonly typedAmountValue: string
  readonly typedPriceValue: string
  readonly [Field.CURRENCY_A]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.CURRENCY_B]: {
    readonly currencyId: string | undefined
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
}

const initialState: TradeState = {
  typedAmountValue: '',
  typedPriceValue: '',
  [Field.CURRENCY_A]: {
    currencyId: ''
  },
  [Field.CURRENCY_B]: {
    currencyId: ''
  },
  recipient: null
}

export default createReducer<TradeState>(initialState, builder =>
  builder
    .addCase(
      replaceTradeState,
      (state, { payload: { typedAmountValue, typedPriceValue, recipient, currencyAId, currencyBId } }) => {
        return {
          [Field.CURRENCY_A]: {
            currencyId: currencyAId
          },
          [Field.CURRENCY_B]: {
            currencyId: currencyBId
          },
          typedAmountValue: typedAmountValue,
          typedPriceValue: typedPriceValue,
          recipient
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId }
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId }
        }
      }
    })
    .addCase(switchCurrencies, state => {
      return {
        ...state,
        [Field.CURRENCY_A]: { currencyId: state[Field.CURRENCY_B].currencyId },
        [Field.CURRENCY_B]: { currencyId: state[Field.CURRENCY_A].currencyId }
      }
    })
    .addCase(typeInput, (state, { payload: { input, typedValue } }) => {
      return {
        ...state,
        input,
        typedValue
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
)
