'use strict';

const parseJson = require('./parse-json');
const parseUrl = require('./parse-url');
const debug = require('debug')('http:router');

const Router = module.exports = function() {
  debug('#Router');
  this.routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
  };
};

['get', 'post', 'put', 'delete'].forEach(verb => {
  Router.prototype[verb] = function(endpoint, callback) {
    this.routes[verb.toUpperCase()][endpoint] = callback;
  };
});

Router.prototype.route = function() {
  debug('#routes');
  return (req, res) => {
    Promise.all([
      parseUrl(req),
      parseJson(req),
    ])
    .then(() => {
      if(typeof this.routes[req.method][req.url.pathname] === 'function') {
        this.routes[req.method][req.url.pathname](req, res);
        return;
      }

      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.write('route not found');
      res.end();
    })
    .catch(err => {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.write('bad request', err);
      res.end();
    });
  };
};