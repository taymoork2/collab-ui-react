(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('LineListService', LineListService);

  /* @ngInject */
  function LineListService($http, $q, $translate, Config, Log, DidDnListService) {

    // define functions available in this factory
    var service = {
      getLineList: getLineList,
      exportCSV: exportCSV
    };
    return service;

    function getLineList(startIndex, count, sortBy, sortOrder, searchStr, filterType) {
      return DidDnListService.query({
          skip: startIndex,
          count: count,
          sortBy: sortBy,
          sortOrder: sortOrder,
          searchStr: searchStr,
          filterType: filterType
        })
        .$promise.then(function (response) {
          return response;
        });
    } // end of function getLineList

    function exportCSV(scope) {
      // add export code here

      var linesPerPage = Config.usersperpage;
      var sortBy = "internalNumber";
      var sortOrder = "ascending";
      var searchStr = "";
      var filterType = "all";
      var deferred = $q.defer();
      var lines = [];
      var page = 0;
      var exportedLines = [];

      getLinesInBatches(1);

      function getLinesInBatches(startIndex) {
        getLineList(startIndex, linesPerPage, sortBy, sortOrder, searchStr, filterType)
          .then(function (response) {

            // if (response.length > 0) {
            //   lines = lines.concat(response);
            //   page++;
            //   getLinesInBatches(page * 1000 + 1);
            // } else if (response.length <= 0) {
            if (response.length > 0) { // temporary replaces above condition checks for use with dummy data
              lines = lines.concat(response); // temporary replaces above condition checks for use with dummy data
              Log.debug("No more lines returned. Exporting to file.");

              if (lines.length === 0) {
                Log.debug('No lines found.');
                return;
              }

              // format data for export
              for (var i = 0; i < lines.length; i++) {
                var exportedLine = {};
                exportedLine.internalNumber = lines[i].internalNumber;
                exportedLine.externalNumber = lines[i].externalNumber;
                exportedLine.userName = lines[i].userName;
                exportedLines.push(exportedLine);
              } // end of for-loop
              deferred.resolve(exportedLines);
            } else {
              Log.debug("Exporting lines failed.");
              deferred.reject("Exporting lines failed.");
            }
          })
          .catch(function (response) {
            Log.debug('Query for all lines failed.');
            deferred.reject("Exporting lines failed.");
          });
      } // end of getLinesInBatches
      return deferred.promise;
    } // end of exportCSV
  } // end of function LineListService
})();
