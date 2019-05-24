import React from 'react';
import Product from './Product';
import Layout from '../../components/Layout';

async function action({ params }) {
  const productId = params.id

  return {
    title: 'Resultado de la busqueda',
    chunks: ['home'],
    component: (
      <Layout>
        <Product productId={productId} />
      </Layout>
    ),
  };
}

export default action;