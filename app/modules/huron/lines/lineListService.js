(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('LineListService', LineListService);

  /* @ngInject */
  function LineListService($http, $q, $translate, Authinfo, Config, Log, UserLineAssociationService, UserLineAssociationCountService) {

    // define functions available in this factory
    var service = {
      getLineList: getLineList,
      getCount: getCount,
      exportCSV: exportCSV
    };
    return service;

    function getCount(searchStr) {
      var wildcard = "%";

      var queryString = {
        'customerId': Authinfo.getOrgId()
      };

      if (searchStr.length > 0) {
        queryString.userid = wildcard + searchStr + wildcard;
        queryString.internalnumber = wildcard + searchStr + wildcard;
        queryString.externalnumber = wildcard + searchStr + wildcard;

        queryString.predicatejoinoperator = "or";
      }

      return UserLineAssociationCountService.query(queryString)
        .$promise.then(function (response) {
          if (response === undefined || response[0] === undefined) {
            return $q.reject(response);
          }
          // there should only be one element in the response array; take the first one
          // because it is the one we want
          return response[0];
        });
    }

    function getLineList(startIndex, count, sortBy, sortOrder, searchStr, filterType) {
      var wildcard = "%";

      var queryString = {
        'customerId': Authinfo.getOrgId()
      };

      if (searchStr.length > 0) {
        queryString.userid = wildcard + searchStr + wildcard;
        queryString.internalnumber = wildcard + searchStr + wildcard;
        queryString.externalnumber = wildcard + searchStr + wildcard;

        queryString.predicatejoinoperator = "or";
      }

      switch (filterType) {
      case "assignedLines":
        queryString.assignedlines = "true";
        break;
      case "unassignedLines":
        queryString.assignedlines = "false";
        break;
      }

      queryString.offset = startIndex;
      queryString.limit = count;
      queryString.order = sortBy + sortOrder;

      return UserLineAssociationService.query(queryString)
        .$promise;
    } // end of function getLineList

    function exportCSV(scope) {
      // add export code here

      var linesPerPage = Config.usersperpage;
      var sortBy = "internalnumber";
      var sortOrder = "-asc";
      var searchStr = "";
      var filterType = "all";
      var deferred = $q.defer();
      var lines = [];
      var page = 0;
      var exportedLines = [];

      getLinesInBatches(0);

      function getLinesInBatches(startIndex) {
        getLineList(startIndex, linesPerPage, sortBy, sortOrder, searchStr, filterType)
          .then(function (response) {

            if (response.length > 0) {
              lines = lines.concat(response);
              page++;
              getLinesInBatches(page * 100 + 1);
            } else if (response.length <= 0) {
              Log.debug("No more lines returned. Exporting to file.");

              if (lines.length === 0) {
                Log.debug('No lines found.');
                return;
              }
              // header line for CSV file
              var headerLine = {};
              headerLine.internalNumber = "internalNumber";
              headerLine.externalNumber = "externalNumber";
              headerLine.userId = "userId";
              exportedLines.push(headerLine);

              // data to export for CSV file
              for (var i = 0; i < lines.length; i++) {
                var exportedLine = {};
                exportedLine.internalNumber = lines[i].internalNumber;
                exportedLine.externalNumber = lines[i].externalNumber;
                exportedLine.userId = lines[i].userId;
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
