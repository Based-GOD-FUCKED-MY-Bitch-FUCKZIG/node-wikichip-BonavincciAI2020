# WikiChip

`npm i wikichip --save`

Query the WikiChip (https://en.wikichip.org/) website for processor information.

 * Requires node v4.x and higher for native `Promises` support.

#### Usage:

 `var WikiChip = require('wikichip')([Parsed Url])`
 
  * Optional; The options are any valid `url.format` object paramater. - https://nodejs.org/api/url.html#url_url_format_urlobj


`WikiChip.search([Search Object])`
 * Search WikiChip.

`WikiChip.info([InfoKey String])`
 * Get information based on the `infokey` string returned from a search.


#### Example:
```javascript
var WikiChip = require('wikichip')();

// Search for a specific manufacturer with a specific base frequency.
WikiChip.search({ manufacturer: 'Intel', 'base frequency': '2800' }).then(function (res) {

   // Print the list of processors matching the search paramaters.
   console.log(JSON.stringify(res, true, 4));

   // Loop all the results.
   res.forEach(function (obj) {

      // Query for information based on the 'infokey'
      WikiChip.info(obj.infokey).then(function (res) {

         // Print all the information results.
         console.log(JSON.stringify(res, true, 4));

      }).catch(function (e) {
         console.trace(e.stack);
      });
   });
 }).catch(function (e) {
   console.trace(e.stack);
});
```

###### More information to come later.

## License

  [MIT](LICENSE)
