
# @asefux/paper

## installation

`npm install --save @asefux/paper`

## usage

const {Book} = require('@asefux/paper');

const book = new Book();

book.log([Date.now(), 'buy', 'self', 'usd', 100, 'self', 'eur', 88.578]);

book.pairsValue();

book.pValue();

## changes

| Version | Description                                                               |
|---------|---------------------------------------------------------------------------|
| 0.1.0   | Book                                                                      |
