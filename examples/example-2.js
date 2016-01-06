var WikiChip = require('../')({ protocol: 'http' });

// Search for a specific model number.
WikiChip.search({ 'model_number': '3855U' }).then(function (res) {

   // Pring the search results.
   console.log(JSON.stringify(res, true, 4));

   // Retrieve all the information on the search results.
   WikiChip.info(res.infokey).then(function (res) {

      // Print all the information.
      console.log(JSON.stringify(res, true, 4));

    }).catch(function (e) {
      console.trace(e.stack);
   });
 }).catch(function (e) {
   console.trace(e.stack);
});

