import React from 'react';
import TokenIconComponent from '../components/TokenIconComponent';

class NFTPaymentRowComponent extends React.Component {
  
  render() {
    return(
      <div className='PaymentRow ChangePaymentRow' onClick={ ()=> this.props.navigateIfActionable(this.props.navigate, 'ChangePaymentToken', this.props.dialogContext) }>
        <div className='NFTPaymentHeader'>
          <div className='PaymentColumn PaymentColumn1'>
          </div>
          <div className='PaymentColumn PaymentColumn2'>
            <div className='PaymentDescription'>
              Payment
            </div>
          </div>
          <div className='PaymentColumn PaymentColumn3'>
          </div>
        </div>
        <div className='NFTPaymentBody'>
          <div className='PaymentColumn PaymentColumn1'>
            <TokenIconComponent
              title={ 'OpenSea Exchange' }
              src={ 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png' }
            />
          </div>
          <div className='PaymentColumn PaymentColumn2'>
            <TokenIconComponent
              title={ this.props.selected.token.name }
              src={ this.props.selected.token.logoURI }
              className='NFTImage'
            />
          </div>
          <div className='PaymentColumn PaymentColumn3'>
            <span className='PaymentAction' title='Change payment'>
              Change
            </span>
          </div>
        </div>
        <div className='NFTPaymentFooter'>
          <div className='PaymentColumn PaymentColumn1'>
          </div>
          <div className='PaymentColumn PaymentColumn2'>
            <div className='PaymentAmountRow1 TextEllipsis'>
              { this.props.paymentContext.token }
            </div>
            <div className='PaymentAmountRow2 TextEllipsis'>
              { this.props.paymentContext.local }
            </div>
          </div>
          <div className='PaymentColumn PaymentColumn3'>
          </div>
        </div>
      </div>
    )
  }
}

export default NFTPaymentRowComponent;
