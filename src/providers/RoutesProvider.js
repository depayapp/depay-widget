import React from 'react';
import RoutesContext from '../contexts/RoutesContext';
import UniswapV2FactoryAbi from '../abi/UniswapV2FactoryAbi';
import UniswapV2PairAbi from '../abi/UniswapV2PairAbi';
import UniswapV2Router02Abi from '../abi/UniswapV2Router02Abi';

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

// Provides potential routes (the most optimal per token)
// Example: [{
//  route: ["0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb", "", ""],
//  token: { "name": "DePay", "address": "0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb", "symbol": "DEPAY", "decimals": 18, "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb/logo.png" },
//  required: 200000,
//  balance: 44000000,
//  fee: 4220000 (in gwei)
// }, ...]
//
// Can contain ETH without any routes, as ETH is a native currency and not a token (otherwise it would be WETH)
// Example: [{
//  route: [],
//  token: { "name": "Ether", "symbol": "ETH", "decimals": 18, "logoURI": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAIVBMVEVHcExkgexjf+tifutifurAy/b///+CmO6hsvJxi+zj6PuyVvwSAAAABHRSTlMANYHDscZ74QAAA+NJREFUeNq1ml1y2jAQx+PAATwpB0gmHCANPkAhZgg849g+QDwZnh1o3w29AJNp817aYzayLa8d7YditXqE7i/674fYlXrGrIvrySQMJ5Pbq7Mey7sOW+vW72XeH3ERIuvqw3++7ya8ICTWnd/XHgj97YEg2zsRxqGwZrz9p1Bcnzn789BiXcoO6O2GUWi1pqwAFxFagCwCtx9g//Y+xz69sd/Aas1uQU6Bh4RLBnkDiyw6ylsAD5gKsqhAv7ixDMEhi2I6EPIGllkWRSG5BbkK5wpQ2FSlh/+ZrQKk+He+TRWcFCChKkJ24X2mAFFOuFEuoxcFIDVcygoeFIDWICpYZApAaxAVrDRgTWgQFZQARoOoQAOiI6/BIxQAoOBzaYB/fQBATNQD64LlCQAR74SAKKQKwGi44wsJAHRBcS44tQEJ54QRUUgNgE7GKXOWvGgAp2HG+PChC0hoL3pEGmoAq8EnK2n1HrAm62lIpCEAmGT8QgVhmbUBdEFNqSCsTEBBhSFgFQAgpsJApiEAmIIiojjPAMBr8PEobjFAisdxwCvY7BtAgpfTEC0kvR6jHRByNBGGTCFlv6JoB4Q1ChhhhdTYvwHeCIyGKZZHi8a+Auy+0sk4wwCrtv93LUKBAQLyPNcAIMRYKgZ4IW0iAADhaAWYl/YNQBP2tQYZcFDhfw+oghFbAU61PQCAgFSTqaAMHwA6hMICsG3sAdA4IrUARN216xIsAD84gBlHxInPNOCbGAWTYNrLgOX+HQDsZQAQTEBoB1B+WmCAEm0CxoYHFOHeBKiPl98tzoP5UyeYnQDuCxMwMmvhT7mRLuBn+VmCHGlD5Ej93SLUAah2lfKnMhzqKYSitq/8kiOAAXooFw2hsV+gx/IN9tP2+nYi5cpEA3Rk19hPm4cf6486mMpeb+eINklEd/BYB1MHkOgQmgbD/GGog7nLm5AUeIMxJjqkOphVAOkfJmiyzJ+WtHvGxESTNaQ7FLVnKK2CaPPO6Q5jU7TsE6rR9JgeZ5PD4ZCSA0NA9ShVOujDJSdHljHXrD89cx3SjB44XsVmGwaOgVW7f6RHHq//wOFzV1hdQEEOLFLDzzb77Oh7aANidvT1+k6ufjP+95ud74QLiC0AUuEC4pyZXZmZ71K6hCk1sFMnaKCnX14BaCDTWVYgzM+cAlHDqgIUggJ+AicvgXybC8mDAsRWzwSDD95owpWolM5sGstb2GY6CeTL8QDXwB8l8tX4ib8al7fwkqIb+D/PA84PFO5PJM6PNO7PRM4PVe5PZe6Pde7Phc4Plu5Ppu6Ptu7Pxu4P1//g6dz98d7+vw/8BVHcYRQ1d5GsAAAAAElFTkSuQmCC" },
//  required: 200000,
//  balance: 44000000,
//  fee: 20000 (in gwei)
// }, ...]
//
class RoutesProvider extends React.Component {
  state = {
    initializing: true,
    routes: null,
    selected: null
  };

  changeSelected(index) {
    this.setState({
      selected: this.state.routes[index]
    });
  }

  componentDidMount() {
    this.getAllTokenRoutes()
      .then(this.unshiftETHRoute.bind(this))
      .then(this.sortRoutes.bind(this))
      .then(function(routes){
        this.setState({
          initializing: false,
          routes,
          selected: routes[0]
        })
      }.bind(this))
  }

  getAllTokenRoutes() {
    return new Promise(function(resolve, reject){
      fetch(`https://depay.app/api/payment/${this.props.address}`).then(function(response){
        response.json().then(function(tokens) {
          this.filterTokensWithBalance(tokens)
          .then(this.filterTokensWithLiquidity)
          .then(this.mapBasicTokenDetailsToRoute.bind(this))
          .then(this.retrieveRequiredAmounts.bind(this))
          .then(function(routes){
            resolve(routes);
          })
        }.bind(this))
      }.bind(this))
    }.bind(this));
  }

  filterTokensWithBalance(tokens){
    return new Promise(function(resolve, reject){
      resolve(
        tokens.filter(function(token){
          return token.balance > 0
        })
      )
    });
  }

  mapBasicTokenDetailsToRoute(tokens) {
    return(
      tokens.map(function(token){
        let address = DePay.ethers.utils.getAddress(token.address);
        return {
          token: {
            name: token.name,
            address: address,
            symbol: token.symbol,
            decimals: parseInt(token.decimals, 10),
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/'+address+'/logo.png'
          },
          route: [address, WETH, this.props.token],
          amounts: [],
          balance: token.balance.toLocaleString('fullwide', {useGrouping:false}),
          fee: 100000 // approx gas for uniswap
        }
      }.bind(this))
    )
  }

  filterTokensWithLiquidity(tokens) {
    const UniswapV2FactoryContract = new DePay.ethers.Contract('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', UniswapV2FactoryAbi, DePay.ethers.provider);
    return new Promise(function(resolve, reject){
      Promise.all(tokens.map(function(token){
        return UniswapV2FactoryContract.getPair(
          token.address, 
          WETH
        ) 
      })).then(function(pairAddress){
        return pairAddress.map(function(address, index){
          return {
            address,
            token: tokens[index]
          }
        }).filter(function(pairTokenAddress){
          return pairTokenAddress.address !== DePay.ethers.constants.AddressZero
        })
      }).then(function(pairTokenAddresses){
        Promise.all(pairTokenAddresses.map(function(pairTokenAddress){
          const UniswapV2PairContract = new DePay.ethers.Contract(pairTokenAddress.address, UniswapV2PairAbi, DePay.ethers.provider);
          return UniswapV2PairContract.getReserves()
        }))
        .then(function(reserves){
          return pairTokenAddresses.filter(function(_, index){
            const reserve = reserves[index];
            return reserve[0].gt(0) && reserve[1].gt(0)
          })
        })
        .then(function(pairTokenAddresses){
          resolve(
            pairTokenAddresses.map(function(pairTokenAddress){
              return pairTokenAddress.token
            })
          )
        })
      })
    });
  }

  retrieveRequiredAmounts(routes) {
    return new Promise(function(resolve, reject){
      const UniswapV2Router02Contract = new DePay.ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', UniswapV2Router02Abi, DePay.ethers.provider);
      UniswapV2Router02Contract.getAmountsIn(
        this.props.amount,
        [WETH, this.props.token]
      ).then(function(amounts){
        const requiredETHToToken = amounts[0];
        Promise.all(routes.map(function(route){
          return new Promise(function(resolve, reject){
            UniswapV2Router02Contract.getAmountsIn(
              requiredETHToToken.toString(),
              [route.route[0], WETH]
            ).then(resolve).catch(()=>resolve(null))
          })
        })).then(function(amounts){
          resolve(
            amounts.map(function(amounts, index){
              if(amounts === null) { return null }
              return Object.assign(routes[index], {
                amounts: [amounts[0].toString(), requiredETHToToken.toString(), this.props.amount]
              })
            }.bind(this)).filter((amounts)=>amounts !== null)
          )
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  unshiftETHRoute(routes) {
    return new Promise(function(resolve, reject){
      const UniswapV2Router02Contract = new DePay.ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', UniswapV2Router02Abi, DePay.ethers.provider);
      UniswapV2Router02Contract.getAmountsIn(
        this.props.amount,
        [WETH, this.props.token]
      ).then(function(amounts){
        this.props.wallet.balance().then(function(balance){
          resolve(
            [{
              token: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
                logoURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAIVBMVEVHcExkgexjf+tifutifurAy/b///+CmO6hsvJxi+zj6PuyVvwSAAAABHRSTlMANYHDscZ74QAAA+NJREFUeNq1ml1y2jAQx+PAATwpB0gmHCANPkAhZgg849g+QDwZnh1o3w29AJNp817aYzayLa8d7YditXqE7i/674fYlXrGrIvrySQMJ5Pbq7Mey7sOW+vW72XeH3ERIuvqw3++7ya8ICTWnd/XHgj97YEg2zsRxqGwZrz9p1Bcnzn789BiXcoO6O2GUWi1pqwAFxFagCwCtx9g//Y+xz69sd/Aas1uQU6Bh4RLBnkDiyw6ylsAD5gKsqhAv7ixDMEhi2I6EPIGllkWRSG5BbkK5wpQ2FSlh/+ZrQKk+He+TRWcFCChKkJ24X2mAFFOuFEuoxcFIDVcygoeFIDWICpYZApAaxAVrDRgTWgQFZQARoOoQAOiI6/BIxQAoOBzaYB/fQBATNQD64LlCQAR74SAKKQKwGi44wsJAHRBcS44tQEJ54QRUUgNgE7GKXOWvGgAp2HG+PChC0hoL3pEGmoAq8EnK2n1HrAm62lIpCEAmGT8QgVhmbUBdEFNqSCsTEBBhSFgFQAgpsJApiEAmIIiojjPAMBr8PEobjFAisdxwCvY7BtAgpfTEC0kvR6jHRByNBGGTCFlv6JoB4Q1ChhhhdTYvwHeCIyGKZZHi8a+Auy+0sk4wwCrtv93LUKBAQLyPNcAIMRYKgZ4IW0iAADhaAWYl/YNQBP2tQYZcFDhfw+oghFbAU61PQCAgFSTqaAMHwA6hMICsG3sAdA4IrUARN216xIsAD84gBlHxInPNOCbGAWTYNrLgOX+HQDsZQAQTEBoB1B+WmCAEm0CxoYHFOHeBKiPl98tzoP5UyeYnQDuCxMwMmvhT7mRLuBn+VmCHGlD5Ej93SLUAah2lfKnMhzqKYSitq/8kiOAAXooFw2hsV+gx/IN9tP2+nYi5cpEA3Rk19hPm4cf6486mMpeb+eINklEd/BYB1MHkOgQmgbD/GGog7nLm5AUeIMxJjqkOphVAOkfJmiyzJ+WtHvGxESTNaQ7FLVnKK2CaPPO6Q5jU7TsE6rR9JgeZ5PD4ZCSA0NA9ShVOujDJSdHljHXrD89cx3SjB44XsVmGwaOgVW7f6RHHq//wOFzV1hdQEEOLFLDzzb77Oh7aANidvT1+k6ufjP+95ud74QLiC0AUuEC4pyZXZmZ71K6hCk1sFMnaKCnX14BaCDTWVYgzM+cAlHDqgIUggJ+AicvgXybC8mDAsRWzwSDD95owpWolM5sGstb2GY6CeTL8QDXwB8l8tX4ib8al7fwkqIb+D/PA84PFO5PJM6PNO7PRM4PVe5PZe6Pde7Phc4Plu5Ppu6Ptu7Pxu4P1//g6dz98d7+vw/8BVHcYRQ1d5GsAAAAAElFTkSuQmCC'
              },
              route: [WETH, this.props.token],
              amounts: [amounts[0].toString(), amounts[0].toString(), this.props.amount],
              balance: balance.toString(),
              fee: 100000 // approx gas for uniswap
            }].concat(routes)
          )
        }.bind(this))
      }.bind(this))
    }.bind(this));
  }

  sortRoutes(routes) {
    return routes.map(function(route){
      return route;
    });
  }

  render() {
    return(
      <RoutesContext.Provider value={{
        initializing: this.state.initializing,
        routes: this.state.routes,
        selected: this.state.selected,
        change: this.changeSelected.bind(this),
      }}>
        {this.props.children}
      </RoutesContext.Provider>
    )
  }
}

export default RoutesProvider;
