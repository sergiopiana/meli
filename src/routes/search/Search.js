/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import queryString from 'query-string';
import s from './Search.scss';
import Breadcrumb from '../../components/breadcrumb'
import Itemcard from '../../components/itemcard'
import Link from '../../components/Link';
import _ from 'lodash';

class Search extends React.Component {
  constructor(props){
    super(props)
    this.state = {query:[] }
    this.state = {items:[] }
    this.state = {categories:[] }
    this.state = {message:"" }
  }

  componentDidMount() {
    const query = window.location.search.substring(1);
    const parsed = queryString.parse(query)
    let categories = []
    fetch(`/api/items?search=${parsed.search}`)
    .then(response => response.json())
    .then((json) => {
      this.setState({items: json.items, categories: json.categories})
      
    }) 
    .catch((err) => this.setState({message:'Hubo un error, por favor intente nuevamente'}))

  }
  
  render() {
    const {message} = this.state;
    const items  = this.state.items;
    const category = this.state.categories;  
    if ((!items || items.length === 0) && (!category || category.length === 0)) {
      return <div><center><h4>{message}</h4></center></div>;
    } 
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Breadcrumb category={category.id} />
            <ol className={s.items}>
              {items.map((item, i)=>
              <Link key={i} className={s.link} to={`/items/${item.id}/#`}>
                <li><Itemcard item={item} /></li>
              </Link>
              )}
            </ol>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Search);
