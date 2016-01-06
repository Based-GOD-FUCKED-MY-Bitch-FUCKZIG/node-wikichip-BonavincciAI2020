/*!
 * wikichip
 * Copyright(c) 2016 Louis T. <louist@ltdev.im>
 * MIT Licensed
*/

var http = require('http'),
    https = require('https'),
    querystring = require('querystring'),
    url = require('url'),
    util = require('util');

function WikiChip (opts) {
         if (!(this instanceof WikiChip)) {
            return new WikiChip(opts);
         }
         this.settings = Object.assign({
             // XXX: Default to HTTPS after WikiChip gets a valid cert.
             url: Object.assign(url.parse("http://en.wikichip.org/w/api.php"), {
                      // XXX: Disable SSL validation until WikiChip gets a valid SSL certificate.
                      rejectUnauthorized: false,
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
         if (!/^https?:$/i.test(opts.protocol)) {
            // XXX: Default to HTTPS after WikiChip gets a valid cert.
            opts.protocol = (/^https?/i.test(opts.protocol)?opts.protocol+':':'http:');
         }
         var deferred = Promise.defer();
         (opts.protocol==='https:'?https:http).get(url.format(opts), function (res) {
             var chunks = [];
             res.on('data', function (chunk) {
                 chunks.push(chunk.toString());
              }).on('end', function () {
                 try {
                    var json = JSON.parse(chunks.join(''));
                    if (!json.error) {
                       deferred.resolve(json);
                     } else {
                       deferred.reject(new Error(json.error.query[0]));
                    }
                  } catch (error) {
                    deferred.reject(error);
                 }
              }).on('error', function (error) {
                 deferred.reject(error);
             });
          }).on('error', function (error) {
             deferred.reject(error);
         });
         return deferred.promise;
}

WikiChip.prototype.__buildQueryOptions = function (opts) {
         return Object.assign({}, this.settings.url, {
             query: Object.assign({}, this.settings.url.query, opts)
         });
}

WikiChip.prototype.info = function (str) {
         if (!(str && str.constructor === String)) {
            return Promise.reject(new Error('Input is not a valid string!'));
         }
         var deferred = Promise.defer();
         this.__makeRequest(this.__buildQueryOptions({
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
                  deferred.resolve(output);
                } else {
                  // XXX: Should this be an empty object?
                  deferred.reject(new Error('No information found for your query.'));
               }
             } catch (error) {
               deferred.reject(error);
            }
          }).catch(function (error) {
            deferred.reject(error);
         });
         return deferred.promise;
}

WikiChip.prototype.search = function (opts) {
         if (!(opts === Object(opts))) {
            return Promise.reject(new Error('Search is not a valid object!'));
         }
         var deferred = Promise.defer();
         this.__makeRequest(this.__buildQueryOptions({
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
                   deferred.resolve((output.length >= 2 ? output : output[0]));
                 } else {
                   deferred.resolve([]);
                }
              } catch (error) {
                deferred.reject(error);
             }
          }).catch(function (error) {
             deferred.reject(error);
         });
         return deferred.promise;
}

module.exports = WikiChip;
