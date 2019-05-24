
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Breadcrumb.scss';

class Breadcrumb extends React.Component {
    constructor(props){
        super(props)
        this.state = {categories:[] }
        }

    componentWillMount(){
        const category = this.props.category;
        fetch(`/api/categories/${category}`)
        .then(response => response.json())
        .then((json) => {
        this.setState({categories: json.categories})
        })     
        .catch((err) => console.log('se produzco un error'))

    }
    checkfirst = (i) => {
      if (i != 0 ){
        return '>'
      }
    } 

  render() {
    const categories = this.state.categories;  
     

    if(!categories){
    return (   
    <div className={s.root}>
        <div className={s.container}>
        </div>
    </div> 
    )
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
        <ul className={s.breadcrumb}>
        {categories.map((category, i)=>
        <div key={i}>
            <span  className={s.breadcrumbItems}>{this.checkfirst(i)}</span>
            <li  className={s.breadcrumbItems}>{category.name}</li>
        </div>
        )}
        </ul>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Breadcrumb);
