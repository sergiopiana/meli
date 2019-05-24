import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Product.scss';
import Breadcrumb from '../../components/breadcrumb'


class Product extends React.Component {
  constructor(props){
    super(props)
    this.state = {product:[] }
    this.state = {message:""}
  }

  componentDidMount() {
    fetch(`/api/items/${this.props.productId}`)
    .then(response => response.json())
    .then((product) => this.setState({ product }))
    .catch(() => this.setState({message:'Hubo un error, por favor intente nuevamente'}))

  }


  convertCurrency = (value) => {
    switch (value) {
      case 'ARS':
        return '$'
        case 'US':
          return 'u$s'
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
    } else {
      return '00'
    }
  }

  convertCondition = (value) => {
    switch (value) {
      case 'new':
        return 'Nuevo'
        break;
        case 'used':
          return 'Usado'
          break;    
      default:
        break;
    }
  }
  showQuantity = (value) => {
    if(value > 1){
      return value + ' vendidos'
    }else{
      return value + ' vendido'
    }
  }
  price =  new Intl.NumberFormat("es-AR", { style: "decimal" });

  
  render() {
    const {message} = this.state;
    const product  = this.state.product
    if (!product || product.length === 0) {
      return <div><center><h4>{message}</h4></center></div>;
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          <Breadcrumb category={product.item.category_id} />
          <div className={s.productDetail}>
              <div className={s.row}>
                <div className={s.columnA}>
                    <div className={s.imageContent}>
                      <img className={s.image} src={product.item.picture} alt={product.item.description}/>  
                    </div>
                    <h2 className={s.descriptionTitle}>Descripción del producto</h2>
                    <p className={s.description}>{product.item.description}</p>                      
                </div>
                <div className={s.columnB}>
                    <dl className={s.itemCondition}>{this.convertCondition(product.item.condition)} - {this.showQuantity(product.item.sold_quantity)}</dl> 
                    <h2 className={s.itemTitle}>{product.item.title}</h2> 
                    <div className={s.price}>
                      <span>{this.convertCurrency(product.item.price.currency)}</span> <span>{this.price.format(product.item.price.amount)}</span><span className={s.priceCents}>{this.checkDecimal(product.item.price.decimals)}</span>
                    </div>
                      
                    <button className={s.btnbuy}>Comprar</button>
                </div>                        
              </div>
          </div>    
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Product);
