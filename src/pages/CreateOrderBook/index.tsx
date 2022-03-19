import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token } from '@hybridx-exchange/uniswap-sdk'
import React, { useCallback, useContext, useState } from 'react'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { CreateEditTabs } from '../../components/NavigationTabs'
import Row, { RowFlat } from '../../components/Row'

import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/orderBook/actions'
import { useDerivedOrderBookInfo, useOrderBookActionHandlers, useOrderBookState } from '../../state/orderBook/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { calculateGasMargin, getOrderBookFactoryContract } from '../../utils'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { Wrapper } from '../Pool/styleds'
import { ConfirmCreateModalBottom } from './ConfirmCreateModalBottom'
import { currencyId } from '../../utils/currencyId'
import { PairState } from '../../data/Reserves'
import OrderBookDetailsDropdown from '../../components/swap/OrderBookDetailsDropdown'
import { Field as SwapField } from '../../state/swap/actions'

export default function CreateOrderBook({
  match: {
    params: { currencyIdBase, currencyIdQuote }
  },
  history
}: RouteComponentProps<{ currencyIdBase?: string; currencyIdQuote?: string }>) {
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const currencyBase = useCurrency(currencyIdBase)
  const currencyQuote = useCurrency(currencyIdQuote)

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  // mint state
  const { priceStepValue, minAmountValue } = useOrderBookState()
  const {
    currencies,
    pair,
    pairState,
    orderBook,
    priceStepAmount,
    minAmountAmount,
    noLiquidity,
    error
  } = useDerivedOrderBookInfo(currencyBase ?? undefined, currencyQuote ?? undefined)
  const { onFieldBaseInput, onFieldQuoteInput } = useOrderBookActionHandlers(noLiquidity, orderBook !== null)

  const isValid = !error && pair && pairState === PairState.EXISTS

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [Field.CURRENCY_BASE]: minAmountValue,
    [Field.CURRENCY_QUOTE]: priceStepValue
  }

  const addTransaction = useTransactionAdder()
  const wrappedCurrencyBase = wrappedCurrency(currencyBase ?? undefined, chainId)
  const wrappedCurrencyQuote = wrappedCurrency(currencyQuote ?? undefined, chainId)
  const wrappedCurrencies: { [field in SwapField]?: Token | undefined } = {
    [SwapField.INPUT]: wrappedCurrencyBase,
    [SwapField.OUTPUT]: wrappedCurrencyQuote
  }

  async function onAdd() {
    if (!priceStepAmount || !minAmountAmount || !currencyBase || !currencyQuote) {
      return
    }
    if (!chainId || !library || !account) return
    const orderBookFactory = getOrderBookFactoryContract(chainId, library, account)
    let estimate, method: (...args: any) => Promise<TransactionResponse>, args: Array<string | string[] | number>
    {
      estimate = orderBookFactory.estimateGas.createOrderBook
      method = orderBookFactory.createOrderBook
      args = [
        wrappedCurrencyBase?.address ?? '',
        wrappedCurrencyQuote?.address ?? '',
        priceStepAmount?.raw.toString() ?? '0',
        minAmountAmount?.raw.toString() ?? '0',
        account
      ]
    }

    setAttemptingTxn(true)
    await estimate(...args, {})
      .then(estimatedGasLimit =>
        method(...args, {
          ...{},
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then(response => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary:
              'Create ' +
              currencies[Field.CURRENCY_BASE]?.symbol +
              ' and ' +
              currencies[Field.CURRENCY_QUOTE]?.symbol +
              ' order book with price step ' +
              priceStepAmount?.toSignificant(3) +
              ' and min mount ' +
              minAmountAmount?.toSignificant(3)
          })

          setTxHash(response.hash)

          ReactGA.event({
            category: 'OrderBook',
            action: 'Create',
            label: [currencies[Field.CURRENCY_BASE]?.symbol, currencies[Field.CURRENCY_QUOTE]?.symbol].join('/')
          })
        })
      )
      .catch(error => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const modalHeader = () => {
    return noLiquidity || orderBook ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" borderRadius="20px">
          <RowFlat>
            <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {currencies[Field.CURRENCY_BASE]?.symbol + '/' + currencies[Field.CURRENCY_QUOTE]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_BASE]}
              currency1={currencies[Field.CURRENCY_QUOTE]}
              size={30}
            />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: '20px' }}>
          <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
            {priceStepAmount?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_BASE]}
            currency1={currencies[Field.CURRENCY_QUOTE]}
            size={30}
          />
        </RowFlat>
        <Row>
          <Text fontSize="24px">
            {currencies[Field.CURRENCY_BASE]?.symbol + '/' + currencies[Field.CURRENCY_QUOTE]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <TYPE.italic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
          {`Output is estimated. If the price changes by more than ${minAmountAmount ??
            100}% your transaction will revert.`}
        </TYPE.italic>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmCreateModalBottom
        price={orderBook?.curPrice.multiply('1')}
        currencies={currencies}
        noLiquidity={noLiquidity}
        priceStepAmount={priceStepAmount}
        minAmountAmount={minAmountAmount}
        onAdd={onAdd}
      />
    )
  }

  const pendingText = `Supplying ${minAmountAmount?.toSignificant(6)} ${
    currencies[Field.CURRENCY_BASE]?.symbol
  } and ${priceStepAmount?.toSignificant(6)} ${currencies[Field.CURRENCY_QUOTE]?.symbol}`

  const handleCurrencyBaseSelect = useCallback(
    (currencyBase: Currency) => {
      const newCurrencyIdBase = currencyId(currencyBase)
      if (newCurrencyIdBase === currencyIdQuote) {
        history.push(`/orderbook/${currencyIdQuote}/${currencyIdBase}`)
      } else {
        history.push(`/orderbook/${newCurrencyIdBase}/${currencyIdQuote}`)
      }
    },
    [currencyIdQuote, history, currencyIdBase]
  )
  const handleCurrencyQuoteSelect = useCallback(
    (currencyQuote: Currency) => {
      const newCurrencyIdQuote = currencyId(currencyQuote)
      if (currencyIdBase === newCurrencyIdQuote) {
        if (currencyIdQuote) {
          history.push(`/orderbook/${currencyIdQuote}/${newCurrencyIdQuote}`)
        } else {
          history.push(`/orderbook/${newCurrencyIdQuote}`)
        }
      } else {
        history.push(`/orderbook/${currencyIdBase ? currencyIdBase : 'ROSE'}/${newCurrencyIdQuote}`)
      }
    },
    [currencyIdBase, history, currencyIdQuote]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldBaseInput('')
    }
    setTxHash('')
  }, [onFieldBaseInput, txHash])

  return (
    <>
      <AppBody>
        <CreateEditTabs creating={!orderBook} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="20px">
            {noLiquidity && (
              <ColumnCenter>
                <BlueCard>
                  <AutoColumn gap="10px">
                    <TYPE.link fontWeight={600} color={'primaryText1'}>
                      You need to create the token pair before creating an order book.
                    </TYPE.link>
                    <StyledInternalLink
                      id="add-liquidity-before-create-order-book"
                      to={'/add/' + wrappedCurrencyBase?.address + '/' + wrappedCurrencyQuote?.address}
                    >
                      {'Add Liquidity'}
                    </StyledInternalLink>
                  </AutoColumn>
                </BlueCard>
              </ColumnCenter>
            )}
            {orderBook && orderBook.buyOrders.length > 0 && orderBook.sellOrders.length > 0 && (
              <ColumnCenter>
                <BlueCard>
                  <AutoColumn gap="10px">
                    <TYPE.link fontWeight={600} color={'primaryText1'}>
                      You can only modify order book parameters without any orders.
                    </TYPE.link>
                  </AutoColumn>
                </BlueCard>
              </ColumnCenter>
            )}
            <CurrencyInputPanel
              label={'Choose base token and input minimum amount'}
              value={formattedAmounts[Field.CURRENCY_BASE]}
              showMaxButton={false}
              hideBalance={true}
              onUserInput={onFieldBaseInput}
              onCurrencySelect={handleCurrencyBaseSelect}
              currency={currencies[Field.CURRENCY_BASE]}
              id="create-order-book-base-token-input-min-amount"
              showCommonBases
            />
            <ColumnCenter>
              <Plus size="16" color={theme.text2} />
            </ColumnCenter>
            <CurrencyInputPanel
              label={'Choose quote token and input price step'}
              value={formattedAmounts[Field.CURRENCY_QUOTE]}
              showMaxButton={false}
              hideBalance={true}
              onUserInput={onFieldQuoteInput}
              onCurrencySelect={handleCurrencyQuoteSelect}
              currency={currencies[Field.CURRENCY_QUOTE]}
              id="create-order-book-quote-token-price-step"
              showCommonBases
            />

            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : (
              <AutoColumn gap={'md'}>
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true)
                  }}
                  disabled={!isValid}
                  error={!isValid && !!priceStepAmount && !!minAmountAmount}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {error ?? (!orderBook ? 'Create' : 'Update')}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
      {orderBook && (
        <OrderBookDetailsDropdown orderBook={orderBook ?? undefined} wrappedCurrencies={wrappedCurrencies} />
      )}
    </>
  )
}
