var WikiChip = require('../')();

// Search for a specific manufacturer with a specific base frequency.
WikiChip.search({ manufacturer: 'Intel', 'base frequency': '2800' }).then(function (res) {

   // Print the list of processors matching the search paramaters.
   console.log(JSON.stringify(res, true, 4));

   // Loop all the results.
   res.forEach(function (obj) {

      // Query for information based on the 'infokey'.
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
