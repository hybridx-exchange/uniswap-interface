import styled from 'styled-components'
import { darken } from 'polished'

export const Tabs = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
`
export const TabItem = styled.div`
text-align: center;
width: 100%;
`
export const InInputPanelput = styled.div`
flex-direction: row;
justify-content: center;
align-items: center;
`
export const Inputtitle = styled.div`
padding:8px 0 0 15px;
background: ${({ theme }) => theme.bg2};
border-top-left-radius: 20px;
border-top-right-radius: 20px;
margin-top:20px;
`
export const Input = styled.input<{ error?: boolean }>`
font-size: 1.25rem;
outline: none;
border-bottom-left-radius: 20px;
border-bottom-right-radius: 20px;
border: 1px solid ${({ theme }) => theme.bg2};
flex: 1 1 auto;
width: 0;
background: ${({ theme }) => theme.bg2};
transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
color: ${({ error, theme }) => (error ? theme.red1 : theme.primary1)};
overflow: hidden;
text-overflow: ellipsis;
font-weight: 500;
width: 100%;
::placeholder {
color: ${({ theme }) => theme.text4};
}
padding: 18px 10px;
-webkit-appearance: textfield;

::-webkit-input-placeholder{
text-align: right;
}
::-webkit-search-decoration {
-webkit-appearance: none;
}

::-webkit-outer-spin-button,
::-webkit-inner-spin-button {
-webkit-appearance: none;
}

::placeholder {
color: ${({ theme }) => theme.text4};
}
`
export const Limitbutton = styled.button`
border-radius: 20px;
border: none;
padding: 16px 20px;
width: 100%;
background-color: ${({ theme }) => theme.blueBG};
color: ${({ theme }) => theme.primaryText2};
font-size: 16px;
font-weight: 500;
&:focus {
  box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary6)};
  background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary6)};
}
&:hover {
  background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary6)};
}
&:active {
  box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary6)};
  background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary6)};
}
:disabled {
  opacity: 0.4;
  :hover {
    cursor: auto;
    // background-color: rgb(0,146,246,0.6);
    background-color: ${({ theme }) => theme.primary6};
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
}
`
export const AmountWraper = styled.div`
position: absolute;
left: 10%; 
top: 30%;
padding:10px;
background: ${({ theme }) => theme.bg1};
border-radius: 10px;
`
export const AmountWraperTitle = styled.div`
display: flex;
 flex-direction: row;
 justify-content: space-between;
 background: ${({ theme }) => theme.bg1};
  `

export const PairWraper = styled.div`
  position: absolute;
  left: 70%;
   top: 30%; 
   background: ${({ theme }) => theme.bg1};
    border-radius: 10px
    padding:10px;
  `