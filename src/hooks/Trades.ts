import { Currency, CurrencyAmount, JSBI, Pair, Token, TokenAmount, Trade } from '@hybridx-exchange/uniswap-sdk'
import flatMap from 'lodash.flatmap'
import { useMemo } from 'react'

import { BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES, ROUTER_ADDRESS } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from './index'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { abi as IUniswapV2Router02ABI } from '@hybridx-exchange/v2-periphery/build/IUniswapV2Router02.json'
import { Interface } from '@ethersproject/abi'
function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[] {
  const { chainId } = useActiveWeb3React()

  const bases: Token[] = chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address
      ),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]
              if (!customBases) return true

              const customBasesA: Token[] | undefined = customBases[tokenA.address]
              const customBasesB: Token[] | undefined = customBases[tokenB.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
              if (customBasesB && !customBasesB.find(base => tokenA.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  )

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {})
      ),
    [allPairs]
  )
}

/**
 * Returns the amount out for the exact amount of tokens in to the given token out
 */
export function useTradeGetPairOutputAmount(
  tokenAmountIn?: TokenAmount,
  tokenIn?: Token,
  tokenOut?: Token
): { loading: boolean; amountOut: TokenAmount | null } {
  const results = useMultipleContractSingleData(
    [ROUTER_ADDRESS],
    new Interface(IUniswapV2Router02ABI),
    'getAmountsOut',
    [tokenAmountIn?.toExact(), [tokenIn ? tokenIn.address : '', tokenOut ? tokenOut.address : '']]
  )

  return useMemo(() => {
    const { result: amounts, loading: loading } = results ? results[0] : { loading: true, result: undefined }
    if (loading || !amounts) {
      return { loading: true, amountOut: null }
    }
    const amount = amounts[1] ? JSBI.BigInt(amounts[1].toString()) : null
    const amountOut = amount && tokenOut ? new TokenAmount(tokenOut, amount) : null
    console.log('amount out:', amountOut?.toExact())
    return {
      amountOut: amountOut,
      loading: loading
    }
  }, [results, tokenOut])
}

/**
 * Returns the amount in for the exact amount of tokens out to the given token in
 */
export function useTradeGetPairInputAmount(
  tokenAmountOut?: TokenAmount,
  tokenIn?: Token,
  tokenOut?: Token
): { loading: boolean; amountIn: TokenAmount | null } {
  const results = useMultipleContractSingleData(
    [ROUTER_ADDRESS],
    new Interface(IUniswapV2Router02ABI),
    'getAmountsIn',
    [tokenAmountOut?.toExact(), [tokenIn ? tokenIn.address : '', tokenOut ? tokenOut.address : '']]
  )

  return useMemo(() => {
    const { result: amounts, loading: loading } = results ? results[0] : { loading: true, result: undefined }
    if (loading || !amounts) {
      return { loading: true, amountIn: null }
    }
    const amount = amounts[0] ? JSBI.BigInt(amounts[0].toString()) : null
    const amountIn = amount && tokenIn ? new TokenAmount(tokenIn, amount) : null
    console.log('amount in:', amountIn?.toExact())
    return {
      amountIn: amountIn,
      loading: loading
    }
  }, [results, tokenIn])
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): Trade | null {
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)
  return useMemo(() => {
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      return (
        Trade.bestTradeExactIn(
          allowedPairs,
          currencyAmountIn,
          currencyOut,
          { maxHops: 3, maxNumResults: 1 },
          useTradeGetPairOutputAmount
        )[0] ?? null
      )
    }
    return null
  }, [allowedPairs, currencyAmountIn, currencyOut])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): Trade | null {
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      return (
        Trade.bestTradeExactOut(
          allowedPairs,
          currencyIn,
          currencyAmountOut,
          { maxHops: 3, maxNumResults: 1 },
          useTradeGetPairInputAmount
        )[0] ?? null
      )
    }
    return null
  }, [allowedPairs, currencyIn, currencyAmountOut])
}
