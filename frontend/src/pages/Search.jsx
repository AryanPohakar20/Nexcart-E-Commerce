import React from 'react';
import Products from './Products';

const Search = () => {
  // We can delegate the full filtered listing and sorting features directly to the Products component,
  // which is already built to read search keywords (?q=...) and category options (?cat=...) from the URL search parameters.
  return <Products />;
};

export default Search;
