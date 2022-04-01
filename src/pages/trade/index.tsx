import { CurrencyAmount, JSBI, Token, Trade, TradeType } from '@hybridx-exchange/uniswap-sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonError, ButtonLight } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmTradeModal from '../../components/trade/ConfirmTradeModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { CreateOrderTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'

import { HYBRIDX_ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field, Input } from '../../state/trade/actions'
import { useDerivedTradeInfo, useTradeActionHandlers, useTradeState } from '../../state/trade/hooks'
import { useExpertModeManager, useUserDeadline } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import AppBody from '../AppBody'
import Loader from '../../components/Loader'
import { OrderBookTable } from '../../components/swap/OrderBookTable'
import { useTradeCallback } from '../../hooks/useTradeCallback'
import { RouteComponentProps } from 'react-router'

export default function DoTrade({
  match: {
    params: { currencyIdA, currencyIdB }
  },
  history
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  // token warning stuff
  const [loadedCurrencyA, loadedCurrencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedCurrencyA, loadedCurrencyB]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedCurrencyA, loadedCurrencyB]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()
  const [deadline] = useUserDeadline()

  // swap state
  const { typedAmountValue, typedPriceValue, recipient } = useTradeState()
  const {
    orderBook,
    trade,
    currencyBalances,
    parsedAmountAmount,
    parsedPriceAmount,
    currencies,
    inputError: tradeInputError
  } = useDerivedTradeInfo()
  const { address: recipientAddress } = useENSAddress(recipient)

  const parsedAmounts = {
    [Input.AMOUNT]: parsedAmountAmount,
    [Input.PRICE]: parsedPriceAmount
  }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useTradeActionHandlers()
  const isValid = !tradeInputError

  const handleTypeAmount = useCallback(
    (value: string) => {
      onUserInput(Input.AMOUNT, value)
    },
    [onUserInput]
  )
  const handleTypePrice = useCallback(
    (value: string) => {
      onUserInput(Input.PRICE, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, tradeErrorMessage, attemptingTxn, txHash }, setTradeState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    tradeErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    tradeErrorMessage: undefined,
    txHash: undefined
  })

  const userHasSpecifiedInputPrice = Boolean(
    currencies[Field.CURRENCY_A] &&
      currencies[Field.CURRENCY_B] &&
      parsedAmounts[Input.AMOUNT]?.greaterThan(JSBI.BigInt(0)) &&
      parsedAmounts[Input.PRICE]?.greaterThan(JSBI.BigInt(0))
  )

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallback(parsedAmountAmount, HYBRIDX_ROUTER_ADDRESS)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.CURRENCY_A])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Input.AMOUNT]?.equalTo(maxAmountInput))
  console.log('trade:', trade)
  // the callback to execute the trade
  const { callback: tradeCallback, error: tradeCallbackError } = useTradeCallback(trade, deadline, recipient)

  const handleTrade = useCallback(() => {
    if (!tradeCallback) {
      return
    }
    setTradeState({ attemptingTxn: true, tradeToConfirm, showConfirm, tradeErrorMessage: undefined, txHash: undefined })
    tradeCallback()
      .then(hash => {
        setTradeState({ attemptingTxn: false, tradeToConfirm, showConfirm, tradeErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Trade',
          action:
            recipient === null
              ? 'Trade w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Trade w/o Send + recipient'
              : 'Trade w/ Send',
          label:
            trade.tradeType.toString() +
            ' ' +
            [trade?.amount?.currency?.symbol, trade?.price?.currency?.symbol].join('/')
        })
      })
      .catch(error => {
        setTradeState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          tradeErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, recipient, recipientAddress, showConfirm, tradeCallback, trade])

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !tradeInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))

  const handleConfirmDismiss = useCallback(() => {
    setTradeState({ showConfirm: false, tradeToConfirm, attemptingTxn, tradeErrorMessage: tradeErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Input.AMOUNT, '')
      onUserInput(Input.PRICE, '')
    }
  }, [attemptingTxn, onUserInput, tradeErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setTradeState({
      tradeToConfirm: trade,
      tradeErrorMessage: tradeErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm
    })
  }, [attemptingTxn, showConfirm, tradeErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.CURRENCY_A, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Input.AMOUNT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.CURRENCY_B, outputCurrency), [
    onCurrencySelection
  ])

  return (
    <>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <AppBody>
        <CreateOrderTabs tradeType={trade.tradeType} />
        <Wrapper id="trade-page">
          <ConfirmTradeModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            onConfirm={handleTrade}
            tradeErrorMessage={tradeErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
              label={trade.tradeType === TradeType.LIMIT_BUY ? 'Buy' : 'Sell'}
              value={typedAmountValue}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.CURRENCY_A]}
              onUserInput={handleTypeAmount}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.CURRENCY_B]}
              id="trade-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={typedPriceValue}
              onUserInput={handleTypePrice}
              label={trade.tradeType === TradeType.LIMIT_BUY ? 'With' : 'At'}
              showMaxButton={false}
              currency={currencies[Field.CURRENCY_B]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.CURRENCY_A]}
              id="trade-currency-output"
            />

            {recipient !== null ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : !orderBook && userHasSpecifiedInputPrice ? (
              <GreyCard style={{ textAlign: 'center' }}>
                <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
              </GreyCard>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleTrade()
                    } else {
                      setTradeState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        tradeErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={!isValid || approval !== ApprovalState.APPROVED}
                  error={isValid}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {`Trade`}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleTrade()
                  } else {
                    setTradeState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      tradeErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="trade-button"
                disabled={!isValid || !!tradeCallbackError}
                error={isValid && !tradeCallbackError}
              >
                <Text fontSize={20} fontWeight={500}>
                  {tradeInputError ? tradeInputError : `Trade`}
                </Text>
              </ButtonError>
            )}
            {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
            {isExpertMode && tradeErrorMessage ? <SwapCallbackError error={tradeErrorMessage} /> : null}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
      <OrderBookTable thData={['amount', 'price', 'price', 'amount']} orderBook={orderBook} />
    </>
  )
}
