var WikiChip = require('../')({ protocol: 'http' });

// Search for all processors with the same base frequency.
WikiChip.search({ 'base_frequency': '2800' }).then(function (res) {

   // Pring the search results.
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

