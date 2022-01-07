import React from 'react';
// import styled from 'styled-components'
import AppBody from '../AppBody';

import { SwapPoolTabs } from '../../components/NavigationTabs'
// import { darken } from 'polished'
import { ButtonLight } from '../../components/Button'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'

import {Tabs,TabItem,InInputPanelput,Inputtitle,Input,Limitbutton,
    AmountWraper,AmountWraperTitle,PairWraper} from './styleds';
import tradStyle from './trad.module.css'

export default function Trade() {
    const { account } = useActiveWeb3React();
    const toggleWalletModal = useWalletModalToggle()

    const value = '';

    const amountSellList = [
        { price: '4600.65', amount: '1.00000', total: '4600.65' },
        { price: '4590.60', amount: '0.91000', total: '4177.446' },
        { price: '4580.50', amount: '0.81000', total: '3710.205' },
        { price: '4570.55', amount: '0.71000', total: '3245.0905' },
        { price: '4560.46', amount: '0.61000', total: '2781.8806' }
    ];
    const amountBuyList = [
        { price: '4500.11', amount: '2.0000', total: '9000.22' },
        { price: '4490.45', amount: '4.0000', total: '17962.16' },
        { price: '4480.23', amount: '6.0000', total: '26881.38' },
        { price: '4470.45', amount: '10.000', total: '44704.5' },
        { price: '4460.12', amount: '20.000', total: '89202.4' }
    ];
    const pairList = [
        { pair: 'ETH/USDC', price: '4530.26', change: '-1.41%' },
        { pair: 'ETH/USDT', price: '4533.78', change: '-1.31%' },
        { pair: 'ETH/DAI', price: '4544.78', change: '-1.21%' },
        { pair: 'WBTC/USDT', price: '44476.78', change: '-1.51%' },
        { pair: 'WBTC/USDC', price: '54465.78', change: '-2.41%' },
        { pair: 'WBTC/DAI', price: '54444.78', change: '-3.21%' },
        { pair: 'DAI/USDT', price: '54465.78', change: '-2.61%' },
        { pair: 'WETH/ETH', price: '54443.78', change: '-0.41%' },
        { pair: 'ETH/FRAX', price: '54434.78', change: '-0.41%' },
    ]

    return (
        <>
            <SwapPoolTabs active={'trade'} />
            <AppBody>
            <div style={{position:'absolute',left:'-50px',top:'50px'}}><button> price </button></div>
            <div style={{position:'absolute',right:'-50px',top:'50px'}}><button>Pair </button></div>
                <Tabs>
                    <TabItem>Limit Buy</TabItem>
                    <TabItem>Limit Sell</TabItem>
                </Tabs>
                <InInputPanelput>
                    {/* <div  onClick={changeLimit}> */}
                    {/* <div>Limit Order</div> */}
                    {/* <StyledDropDown selected={true} /> */}
                    {/* </div> */}
                    <div>
                        <Inputtitle>Price</Inputtitle>
                        <Input
                            className=""
                            type="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            placeholder="当前价格/输入价格"
                            // error={error}
                            pattern="^(0x[a-fA-F0-9]{40})$"
                            // onChange={handleInput}
                            defaultValue={value}
                        />
                    </div>
                    <Inputtitle>Total</Inputtitle>
                    <Input
                        className="recipient-address-input"
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        placeholder="数量"
                        // error={error}
                        pattern="^(0x[a-fA-F0-9]{40})$"
                        // onChange={handleInput}
                        defaultValue={value}
                    />
                </InInputPanelput>
                <div style={{ padding: '10px 0' }}>
                    <div style={{ padding: '2px 0' }}>
                        <span>总输出:&nbsp;&nbsp;&nbsp;</span> <span>100 ETH / 4600</span>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        <span>可成交:&nbsp;&nbsp;&nbsp;</span> <span>50 ETH / 4599</span>
                    </div>
                    <div style={{ padding: '2px 0' }}>
                        <span>未成交:&nbsp;&nbsp;&nbsp;</span> <span>50 ETH / 4610</span>
                    </div>
                </div>
                {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                ) : <Limitbutton>Submit</Limitbutton>}
            </AppBody>

            <AmountWraper>
                <AmountWraperTitle>
                    <span className={tradStyle.padding10}>Price</span>
                    <span className={tradStyle.padding10}>Amount</span>
                    <span className={tradStyle.padding10}>Total(USDC)</span>
                </AmountWraperTitle>

                <div style={{ height:'220px',overflowY:'scroll'}}>
                {
                    amountSellList.map((val, key) => {
                        return (
                            <div style={{width:'100%'}} key={key}>
                                <span style={{ display:'inline-block', padding: '10px',color:'red',textAlign:'left',width:'33.33%' }}>{val.price}</span>
                                <span style={{ display: 'inline-block', padding: '10px 20px',textAlign:'left',width:'33.33%' }}>{val.amount}</span>
                                <span className={tradStyle.padding10} style={{ display: 'inline-block', textAlign:'right',width:'33.33%' }}>{val.total}</span>
                            </div>
                        )
                    })
                }
                </div>
                <div className={tradStyle.flexRow} style={{alignItems:'center'}}>
                    <span style={{ padding: '10px',color:'#3fe199', fontWeight: 'bolder',fontSize:'1.5rem' }}>4530.26</span>
                    <span className={tradStyle.padding10}>LP Price</span>
                    {/* <span style={{ padding: '10px' }}>more</span> */}
                </div>
                {/* <AmountWraperTitle>
                    <span style={{ padding: '10px' }}>Price</span>
                    <span style={{ padding: '10px' }}>Amount</span>
                    <span style={{ padding: '10px' }}>Total(USDC)</span>
                </AmountWraperTitle> */}
                 <div style={{ height:'220px',overflowY:'scroll'}}>
                {
                    amountBuyList.map((val, key) => {
                        return (
                            <div style={{width:'100%'}} key={key}>
                                <span style={{ display: 'inline-block', padding: '10px',color:'red',textAlign:'left',width:'33.33%' }}>{val.price}</span>
                                <span style={{display: 'inline-block', padding: '10px 20px',textAlign:'left',width:'33.33%'}}>{val.amount}</span>
                                <span className={tradStyle.padding10} style={{display: 'inline-block',textAlign:'right',width:'33.33%'}}>{val.total}</span>
                            </div>
                        )
                    })
                }
                </div>
            </AmountWraper>

            <PairWraper>
                <AmountWraperTitle>
                    <span className={tradStyle.padding10}>Pair</span>
                    <span className={tradStyle.padding10}>Price</span>
                    <span className={tradStyle.padding10}>Change</span>
                </AmountWraperTitle>
                <div style={{ height:'400px',overflowY:'scroll'}}>
                {
                    pairList.map((val, key) => {
                        return (
                            <div style={{ width:'100%' }} key={key}>
                                <span style={{display:'inline-block', padding: '10px',textAlign:'left',width:'33.33%' }}>{val.pair}</span>
                                <span style={{display:'inline-block', padding: '10px 30px',color:'red',textAlign:'left',width:'33.33%'}}>{val.price}</span>
                                <span style={{display:'inline-block', padding: '10px',color:'red',textAlign:'right',width:'33.3%'}}>{val.change}</span>
                            </div>
                        )
                    })
                }
                </div>
            </PairWraper>

        </>
    )
}