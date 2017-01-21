/*!
 * wikichip
 * Copyright(c) 2016 Louis T. <louist@ltdev.im>
 * MIT Licensed
 */
var https = require('https'),
    querystring = require('querystring'),
    url = require('url'),
    util = require('util');

function WikiChip (opts) {
         if (!(this instanceof WikiChip)) {
            return new WikiChip(opts);
         }
         this.settings = Object.assign({
             url: Object.assign(url.parse("https://en.wikichip.org/w/api.php"), {
                      headers: {
                          "Accept": "application/json",
                      },
                      // Default query options.
                      query: {
                          action: "browsebysubject",
                          format: "json"
                      }
                  }, (opts?opts:{}))
         });
}
WikiChip.prototype.__makeRequest = function (opts) {
         return this.__Promise(function (resolve, reject) {
             https.get(url.format(opts), function (res) {
                 var chunks = [];
                 res.on('data', function (chunk) {
                     chunks.push(chunk.toString());
                  }).on('end', function () {
                     try {
                        var json = JSON.parse(chunks.join(''));
                        if (!json.error) {
                           resolve(json);
                         } else {
                           reject(new Error(json.error.query[0]));
                        }
                      } catch (error) {
                        reject(error);
                     }
                  }).on('error', function (error) {
                     reject(error);
                 });
              }).on('error', function (error) {
                 reject(error);
             });
         }, this);
};
WikiChip.prototype.__buildQueryOptions = function (opts) {
         return Object.assign({}, this.settings.url, {
             query: Object.assign({}, this.settings.url.query, opts)
         });
};
WikiChip.prototype.__Promise = function (fn, parent) {
         return new Promise(function (resolve, reject) {
             return fn.call(parent, resolve, reject, parent);
         });
};
WikiChip.prototype.info = function (str) {
         if (!(str && str.constructor === String)) {
            return Promise.reject(new Error('Input is not a valid string!'));
         }
         return this.__Promise(function (resolve, reject) {
             return this.__makeRequest(this.__buildQueryOptions({
                 subject: str
             })).then(function (res) {
                try {
                   if (res.query.data.length >= 1) {
                      var output = {};
                      res.query.data.forEach(function (obj) {
                          if (!/^_/.test(obj.property)) {
                             var items = obj.dataitem.map(function (items) {
                                 return items.item.replace(/#.+$/,'');
                             });
                             output[obj.property] = (items.length > 1? items : items[0]);
                          }
                      });
                      resolve(output);
                    } else {
                      // XXX: Should this be an empty object?
                      reject(new Error('No information found for your query.'));
                   }
                 } catch (error) {
                   reject(error);
                }
              }).catch(function (error) {
                reject(error);
             });
          }, this);
};
WikiChip.prototype.search = function (opts) {
         if (!(opts === Object(opts))) {
            return Promise.reject(new Error('Search is not a valid object!'));
         }
         return this.__Promise(function (resolve, reject) {
             return this.__makeRequest(this.__buildQueryOptions({
                 action: 'askargs',
                 conditions: Object.keys(opts).map(function (param) {
                                 return util.format('%s::%s', param, opts[param]);
                             }).join('|'),
                 printouts:  ['name'].concat(Object.keys(opts).map(function (str) {
                                 return str.toLowerCase().replace(/\s+/g,'_');
                             })).join('|')
             })).then(function (res) {
                 try {
                    var output = [];
                    if (res.query.meta.count >= 1) {
                       Object.keys(res.query.results).forEach(function (key) {
                           var data = res.query.results[key];
                           output.push({
                               infokey: key,
                               data: data.printouts
                           });
                       });
                       resolve((output.length >= 2 ? output : output[0]));
                     } else {
                       resolve([]);
                    }
                  } catch (error) {
                    reject(error);
                 }
              }).catch(function (error) {
                 reject(error);
             });
         }, this);
};
module.exports = WikiChip;
