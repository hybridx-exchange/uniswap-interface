import { Route, Currency, CurrencyAmount, Pair, Token, Trade, TradeType } from '@hybridx-exchange/uniswap-sdk'
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
export function useGetBestOutputAmount(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  allPairs?: Pair[],
  allTrades?: Trade[] | null
): { loading: boolean; bestTrade: Trade | null } {
  const paths = allTrades?.map(trade => {
    return trade.route.path.map(token => {
      return token.address
    })
  })

  const lens = allTrades?.map(trade => {
    return trade.route.path.length
  })

  const paths2 = paths ? Array.prototype.concat.apply([], paths) : undefined
  const results = useMultipleContractSingleData(
    [ROUTER_ADDRESS],
    new Interface(IUniswapV2Router02ABI),
    'getBestAmountsOut',
    [currencyAmountIn?.raw.toString(), paths2, lens]
  )
  console.log('amountIn', currencyAmountIn?.raw.toString(), 'result:', results)
  return useMemo(() => {
    const returns = results?.map(result => {
      if (!result || result.loading) return { data: null, loading: result.loading }
      const {
        result: [path, amounts],
        loading
      } = result
      return { data: { path, amounts }, loading: loading }
    })

    if (!returns || returns.length === 0 || returns[0].loading) {
      return { loading: true, bestTrade: null }
    }
    console.log('data:', returns[0].data)
    const data = returns[0].data
    const path = data && data.path ? data.path : []
    const amounts = data && data.amounts ? data.amounts : []
    const pairs: Pair[] = []
    for (let i = 1; i < path?.length; i++) {
      if (allPairs) {
        const pair = allPairs.find(
          e =>
            (e.token0.address === path[i - 1] && e.token1.address === path[i]) ||
            (e.token1.address === path[i - 1] && e.token0.address === path[i])
        )
        if (pair) pairs.push(pair)
      }
    }

    if (!currencyAmountIn || !currencyOut || !allPairs || !allTrades) {
      return { loading: true, bestTrade: null }
    } else {
      return {
        loading: false,
        bestTrade: new Trade(
          new Route(pairs, amounts, currencyAmountIn.currency, currencyOut),
          currencyAmountIn,
          TradeType.EXACT_INPUT
        )
      }
    }
  }, [allPairs, allTrades, currencyAmountIn, currencyOut, results])
}

/**
 * Returns the amount in for the exact amount of tokens out to the given token in
 */
export function useGetBestInputAmount(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
  allPairs?: Pair[],
  allTrades?: Trade[] | null
): { loading: boolean; bestTrade: Trade | null } {
  const paths = allTrades?.map(trade => {
    return trade.route.path.map(token => {
      return token.address
    })
  })

  const lens = allTrades?.map(trade => {
    return trade.route.path.length
  })

  const paths2 = paths ? Array.prototype.concat.apply([], paths) : undefined
  const results = useMultipleContractSingleData(
    [ROUTER_ADDRESS],
    new Interface(IUniswapV2Router02ABI),
    'getBestAmountsIn',
    [currencyAmountOut?.raw.toString(), paths2, lens]
  )
  console.log('amountOut', currencyAmountOut?.raw.toString(), 'result:', results)
  return useMemo(() => {
    const returns = results?.map(result => {
      if (!result || result.loading) return { data: null, loading: result.loading }
      const {
        result: [path, amounts],
        loading
      } = result
      return { data: { path, amounts }, loading: loading }
    })

    if (!returns || returns.length === 0 || returns[0].loading) {
      return { loading: true, bestTrade: null }
    }
    console.log('data:', returns[0].data)
    const data = returns[0].data
    const path = data && data.path ? data.path : []
    const amounts = data && data.amounts ? data.amounts : []
    const pairs: Pair[] = []
    for (let i = 1; i < path?.length; i++) {
      if (allPairs) {
        const pair = allPairs.find(
          e =>
            (e.token0.address === path[i - 1] && e.token1.address === path[i]) ||
            (e.token1.address === path[i - 1] && e.token0.address === path[i])
        )
        if (pair) pairs.push(pair)
      }
    }

    if (!currencyAmountOut || !currencyIn || !allPairs || !allTrades) {
      return { loading: true, bestTrade: null }
    } else {
      return {
        loading: false,
        bestTrade: new Trade(
          new Route(pairs, amounts, currencyIn, currencyAmountOut.currency),
          currencyAmountOut,
          TradeType.EXACT_OUTPUT
        )
      }
    }
  }, [allPairs, allTrades, currencyAmountOut, currencyIn, results])
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): Trade | null {
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)
  const allTrade = useMemo(() => {
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      return Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 3, maxNumResults: 1 })
    }
    return null
  }, [allowedPairs, currencyAmountIn, currencyOut])

  return useGetBestOutputAmount(currencyAmountIn, currencyOut, allowedPairs, allTrade).bestTrade
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): Trade | null {
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)
  const allTrade = useMemo(() => {
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      return Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 3, maxNumResults: 1 })
    }
    return null
  }, [allowedPairs, currencyIn, currencyAmountOut])
  return useGetBestInputAmount(currencyIn, currencyAmountOut, allowedPairs, allTrade).bestTrade
}
