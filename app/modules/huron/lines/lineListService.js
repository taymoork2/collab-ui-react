(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('LineListService', LineListService);

  /* @ngInject */
  function LineListService($q, $translate, Authinfo, Config, ExternalNumberService, Log, PstnSetupService, UserLineAssociationService, PstnSetup) {

    var customerId = Authinfo.getOrgId();
    var apiImplementation = undefined;

    // define functions available in this factory
    var service = {
      getLineList: getLineList,
      exportCSV: exportCSV,
      getApiImplementation: getApiImplementation,
      isResellerExists: isResellerExists,
    };
    return service;

    function getLineList(startIndex, count, sortBy, sortOrder, searchStr, filterType, gridData) {
      var wildcard = "%";

      var queryString = {
        'customerId': customerId,
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

      var linesPromise = UserLineAssociationService.query(queryString).$promise;

      return ExternalNumberService.isTerminusCustomer(customerId).then(function () {
        var orderPromise = PstnSetupService.listPendingOrdersWithDetail(customerId);
        var carrierInfoPromise;

        if (_.isUndefined(apiImplementation)) {
          carrierInfoPromise = ExternalNumberService.getCarrierInfo(customerId);
        }

        return $q.all([linesPromise, orderPromise, carrierInfoPromise]).then(function (results) {
          var lines = results[0];
          var orders = results[1];

          if (!_.isUndefined(results[2])) {
            apiImplementation = _.get(results[2], 'apiImplementation');
          }

          var pendingLines = [];
          var nonProvisionedPendingLines = [];

          if (lines.length === 0) {
            return lines;
          }

          _.forEach(orders, function (order) {
            if (_.get(order, 'operation') === PstnSetupService.BLOCK_ORDER) {
              if (!_.isUndefined(order.attributes.npa)) {
                var areaCode = order.attributes.npa;
              } else {
                areaCode = PstnSetupService.getAreaCode(order);
              }
              nonProvisionedPendingLines.push({
                externalNumber: '(' + areaCode + ') XXX-XXXX ' + $translate.instant('linesPage.quantity', { count: order.numbers.length }),
                status: order.statusMessage !== 'None' ? $translate.instant('linesPage.inProgress') + ' - ' + order.statusMessage : $translate.instant('linesPage.inProgress'),
                tooltip: PstnSetupService.translateStatusMessage(order),
              });
            } else {
              var numbers = _.get(order, 'numbers', []);
              _.forEach(numbers, function (number) {
                var lineFound = _.find(lines, function (line) {
                  return (number.number && number.number === line.externalNumber);
                });
                if (lineFound) {
                  dedupGrid(lineFound, gridData);
                  lineFound.status = order.statusMessage !== 'None' ? $translate.instant('linesPage.inProgress') + ' - ' + order.statusMessage : $translate.instant('linesPage.inProgress');
                  lineFound.tooltip = PstnSetupService.translateStatusMessage(order);
                  pendingLines.push(lineFound);
                } else {
                  nonProvisionedPendingLines.push({
                    externalNumber: number.number,
                    status: order.statusMessage !== 'None' ? $translate.instant('linesPage.inProgress') + ' - ' + order.statusMessage : $translate.instant('linesPage.inProgress'),
                    tooltip: PstnSetupService.translateStatusMessage(order),
                  });
                }
              });
            }
          });

          if (startIndex !== 0) {
            return lines;
          } else if (filterType === 'pending') {
            return pendingLines.concat(nonProvisionedPendingLines);
          } else if (filterType === 'all') {
            return lines.concat(nonProvisionedPendingLines);
          } else {
            return lines;
          }
        });
      })
        .catch(function () {
          return $q.resolve(linesPromise).then(function (results) {
            if (filterType === 'pending') {
              return [];
            } else {
              return results;
            }
          });
        });

    } // end of function getLineList

    function getApiImplementation() {
      return apiImplementation;
    }

    function dedupGrid(newLine, grid) {
      _.remove(grid, function (row) {
        return row.externalNumber === newLine.externalNumber;
      });
    }

    function exportCSV() {
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
              getLinesInBatches((page * 100) + 1);
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
          .catch(function () {
            Log.debug('Query for all lines failed.');
            deferred.reject("Exporting lines failed.");
          });
      } // end of getLinesInBatches
      return deferred.promise;
    } // end of exportCSV

    function isResellerExists() {
      if (!PstnSetup.isResellerExists()) {
        return PstnSetupService.getResellerV2().then(function () {
          // to avoid a re-check later on in pstnSetup state.
          PstnSetup.setResellerExists(true);
          return true;
        })
        .catch(function () {
          return false;
        });
      } else {
        return $q.resolve(true);
      }
    }
  } // end of function LineListService
})();
