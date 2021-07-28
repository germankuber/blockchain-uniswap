const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Rounding, Percent } = require('@uniswap/sdk');
const { ethers } = require('ethers');


const chainId = ChainId.RINKEBY;
const tokenAddress = '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea';

const init = async () => {
    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress);

    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai, weth);

    const route = new Route([pair], weth);
    const amountIn = '10000000000000000'
    const trade = new Trade(route, new TokenAmount(weth, amountIn), TradeType.EXACT_INPUT);

    console.log(route.midPrice.toSignificant(6));
    console.log(route.midPrice.invert().toSignificant(6));
    console.log(trade.executionPrice.toSignificant(6));
    console.log(trade.nextMidPrice.toSignificant(6));

    const slippageTolerance = new Percent('50', '10000');
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;

    const path = [weth.address, dai.address];
    const to = '0x07D64eE8aCf3C61b69d18CDfF324FC3EeE2f886a';
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const value = trade.inputAmount.raw;

    const provider = ethers.getDefaultProvider('rinkeby', {
        infura: 'https://rinkeby.infura.io/v3/fa8891f4fc3240b381e7cf19107027f2'
    });

    const signer = new ethers.Wallet('c03b3b6db5804e75d6502277e84281529a7fcc06b2e562ffbf4650f6e28902c3');
    const account = signer.connect(provider);

    const uniswap = new ethers.Contract(
        '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
        [`function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
            external
            payable
            returns (uint[] memory amounts)`
        ],
        account
    );
const valueHex = ethers.BigNumber.from(value.toString()).toHexString();
    console.log(amountOutMin);
    console.log(path);
    console.log(to);
    console.log(deadline);
    console.log( valueHex);
    const tx = await uniswap.swapExactETHForTokens(
        ethers.BigNumber.from(amountOutMin.toString()).toHexString(),
        path,
        to,
        deadline,
        { value:valueHex, gasPrice: 20e9 }
    );
    console.log(tx.hash);

    const receipt = await tx.wait();
    console.log(receipt.blockNumber);
}

init().then(e => { }).catch(e => console.error(e));