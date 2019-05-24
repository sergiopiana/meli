
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import nodeFetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.scss';
import createFetch from './createFetch';
import router from './router';
import _ from 'lodash';
import chunks from './chunk-manifest.json'; 
import config from './config';

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

const app = express();


//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.set('trust proxy', config.trustProxy);

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const name = 'Sergio';
const lastname = 'Piana';

app.get('/api/items', (req, res)=>{
  const value = req.query.search;
  const limit = 4;
  const uri = `https://api.mercadolibre.com/sites/MLA/search?q=${value}&limit=${limit}`;

  nodeFetch(uri)
    .then(res => res.json())
    .then(json => {
      res.setHeader('content-type', 'application/json');
      let items = [];
      let categories =[];

      categories =  (_.find(json.filters, function(o) { return o.id == 'category'; }))
      
      if(_.isUndefined(categories)){
          categories =  _.find(json.available_filters, function(o) { return o.id == 'category'; })
          categories = _.orderBy(categories,['results'], ['desc'])
          categories = categories[3][0]
        }else{
          categories = categories.values[0]
        }
        
   
     
     for(let i=0; i<json.results.length; i++){
         let price = _.split(json.results[i].price, '.');
         let amount = parseInt(price[0]);
         let decimals = parseInt(price[1]);
         if(!decimals){ decimals = 0}
        let item = {
            id: json.results[i].id,
            title: json.results[i].title,
            price:{
                currency: json.results[i].currency_id,
                amount,
                decimals,
            },
            picture: json.results[i].thumbnail,
            condition: json.results[i].condition,
            free_shipping: json   .results[i].shipping.free_shipping 
        }
        items.push(item);
     }

     let result = {
        author:{ 
            name,
            lastname,
        },
        categories,
        items,

      };
      return res.status(200).send(result);
    });

});



app.get('/api/items/:id', (req, res)=>{
  let value = req.params.id
  const uri = `https://api.mercadolibre.com/items/${value}`;
  nodeFetch(uri)
    .then(res => res.json())
    .then(async json => {
      res.setHeader('content-type', 'application/json');
      let price = priceSplit(json.price);
      let amount = price.amount;
      let decimals = price.decimals;
      
      let description = await getDescription(json.id);
      let item = {
           id: json.id,
           title: json.title,
           price:{
               currency: json.currency_id,
               amount,
               decimals,
           },
           picture : json.pictures[0].url,
           condition : json.condition,
           category_id: json.category_id,
           free_shipping : json.shipping.free_shipping,
           sold_quantity : json.sold_quantity,
           description,          
       }
       
      let result = {
          author:{ 
              name,
              lastname,
          },
          item,
      };
      return res.status(200).send(result);
  });          
});

app.get('/api/categories/:id', (req, res)=>{
  let value = req.params.id
  const uri = `https://api.mercadolibre.com/categories/${value}`;
  nodeFetch(uri)
    .then(res => res.json())
    .then(async json => {
      res.setHeader('content-type', 'application/json');
      
      let categories = json.path_from_root;
      let result = {
          author:{ 
              name,
              lastname,
          },
          categories,
      };
      return res.status(200).send(result);
  });          
});

//functions
const priceSplit = (value) => {
let price = _.split(value, '.');
let amount = parseInt(price[0]);
let decimals = parseInt(price[1]);
if(!decimals){ decimals = 0}  
return {amount, decimals}
}

const getDescription =  (id) => {
  const uri = `https://api.mercadolibre.com/items/${id}/description`;

    return nodeFetch(uri)
    .then(res => res.json())
    .then(json => { return json.plain_text })
}

app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    };

    // Universal HTTP client
    const fetch = createFetch(nodeFetch, {
      baseUrl: config.api.serverUrl,
      cookie: req.headers.cookie,
    });

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      insertCss,
      fetch,
      // The twins below are wild, be careful!
      pathname: req.path,
      query: req.query,
    };

    const route = await router.resolve(context);

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };
    data.children = ReactDOM.renderToString(
          <App context={context}>{route.component}</App>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set();
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk('client');
    if (route.chunk) addChunk(route.chunk);
    if (route.chunks) route.chunks.forEach(addChunk);

    data.scripts = Array.from(scripts);
    data.app = {
      apiUrl: config.api.clientUrl,
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});




//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
    >
      {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
//const promise = models.sync().catch(err => console.error(err.stack));

if (!module.hot) {
    app.listen(config.port, () => {
      console.info(`The server is running at http://localhost:${config.port}/`);
    });

}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
