
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Itemcard.scss';


class Itemcard extends React.Component {
  constructor(props){
    super(props)
    this.state = {item:[] }
  }
  componentWillMount(){
    let item = this.props.item;
    this.setState({item})
    
  }
  convertCurrency = (value) => {
    switch (value) {
      case 'ARS':
        return '$'
        break;
        case 'US':
          return 'u$s'
          break;    
      default:
        break;
    }
  }
  convertCondition = (value) => {
    switch (value) {
      case 'used':
        return 'Usado'
        break;
        case 'new':
          return 'Nuevo'
          break;    
      default:
        break;
    }
  }


  checkDecimal = (value) =>{
    if(value > 0){
      for(let i=value.toString().length; i < 2; i++ ){
      value = value.toString() + 0;
      }
      return value;
    } 
  }

  checkFreeshipping = (value)=> {
    if(value){
      return (<img className={s.dot} src={"/assets/ic_shipping.png"}></img>);
    }
  } 

  price =  new Intl.NumberFormat("es-AR", { style: "decimal" });
 
  render() {
    let { item } = this.state; 
    return (
      <div className={s.container}> 
            <div className={s.columnImg}>
              <img className={s.itemImg} src={item.picture} alt={item.title}></img>
            </div>
            <div className={s.columnText}>
              <div  className={s.price}>
                <span>{this.convertCurrency(item.price.currency)}</span> 
                <span>{this.price.format(item.price.amount)}</span>
                <span className={s.priceCents}>{this.checkDecimal(item.price.decimals)}</span>
                <div className={s.tooltip}> 
                {this.checkFreeshipping(item.free_shipping)}
                <span className={s.itemTooltip}>envío gratis</span>
                </div>
                
              </div>
              <span className={s.itemTitle}>{item.title}</span>
            </div>
            <div className={s.columnCondition}>
              <div className={s.itemCondition}>{this.convertCondition(item.condition)}</div>
            </div>
      </div>
    );
  }
}

export default withStyles(s)(Itemcard);
