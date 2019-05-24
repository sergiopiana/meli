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
import s from './Header.scss';
import Link from '../../components/Link';

class Header extends React.Component {
  constructor(props){
    super(props)
    this.state = {input:[] }
    this.changeInput = this.changeInput.bind(this);
    this.keyPressed = this.keyPressed.bind(this);
  }
  searchItems = () => {
    let value = this.state.input;
    document.location.href=`/items?search=${value}`

  }
  changeInput = (event) => {
    this.setState({input: event.target.value})
  }
  keyPressed(event) {
    if (event.key === "Enter") {
      this.searchItems()
      return false;
    }
  }
  
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Link className={s.link} to="/">
            <img src={"/assets/Logo_ML.png"} className={s.logo} alt="Mercado Libre" alt="Mercado Libre Home" />          
          </Link>
             <input id="search" placeholder="Nunca dejes de buscar" alt="ingresar lo que deseas buscar" value={this.state.input} onChange={this.changeInput} className={s.search } onKeyPress={this.keyPressed}/>
                <button type="submit" className={s.btnSearch} onClick={() => this.searchItems()}>
                  <img src={"/assets/ic_Search.png"} alt="Buscar producto"/>
                </button>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Header);
