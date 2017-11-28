(function () {
  'use strict';

  var BLOCK_ORDER = require('modules/huron/pstn').BLOCK_ORDER;

  angular
    .module('Huron')
    .factory('LineListService', LineListService);

  /* @ngInject */
  function LineListService($q, $translate, Authinfo, Config, ExternalNumberService, FeatureToggleService, Log, PstnService, UserLineAssociationService) {
    var vm = this;
    var customerId = Authinfo.getOrgId();
    var apiImplementation = undefined;
    var vendor = undefined;
    var carrierName = undefined;
    vm.ishI1484 = false;
    // define functions available in this factory
    var service = {
      getLineList: getLineList,
      exportCSV: exportCSV,
      getApiImplementation: getApiImplementation,
      getVendor: getVendor,
      getCarrierName: getCarrierName,
    };
    return service;

    function getLineList(startIndex, count, sortBy, sortOrder, searchStr, filterType, gridData, isH1484) {
      var wildcard = '%';

      var queryString = {
        customerId: customerId,
      };

      if (searchStr.length > 0) {
        queryString.userid = wildcard + searchStr + wildcard;
        queryString.externalnumber = wildcard + searchStr + wildcard;

        if (isH1484) {
          queryString.locationname = wildcard + searchStr + wildcard;
          queryString.sitetositenumber = wildcard + searchStr + wildcard;
        } else {
          queryString.internalnumber = wildcard + searchStr + wildcard;
        }
        queryString.predicatejoinoperator = 'or';
      }

      switch (filterType) {
        case 'assignedLines':
          queryString.assignedlines = 'true';
          break;
        case 'unassignedLines':
          queryString.assignedlines = 'false';
          break;
      }

      queryString.offset = startIndex;
      queryString.limit = count;
      queryString.order = sortBy + sortOrder;

      var linesPromise = UserLineAssociationService.query(queryString).$promise;

      return ExternalNumberService.isTerminusCustomer(customerId).then(function () {
        var orderPromise = PstnService.listPendingOrdersWithDetail(customerId);
        var carrierInfoPromise;

        if (_.isUndefined(apiImplementation)) {
          carrierInfoPromise = ExternalNumberService.getCarrierInfo(customerId);
        }

        return $q.all([linesPromise, orderPromise, carrierInfoPromise]).then(function (results) {
          var lines = results[0];
          var orders = results[1];

          if (!_.isUndefined(results[2]) && results[2] !== null) {
            apiImplementation = _.get(results[2], 'apiImplementation');
            vendor = _.get(results[2], 'vendor');
            carrierName = _.get(results[2], 'name');
          }

          var pendingLines = [];
          var nonProvisionedPendingLines = [];

          if (lines.length === 0) {
            return lines;
          }

          _.forEach(orders, function (order) {
            if (_.get(order, 'operation') === BLOCK_ORDER) {
              if (!_.isUndefined(order.attributes.npa)) {
                var areaCode = order.attributes.npa;
              } else {
                areaCode = PstnService.getAreaCode(order);
              }
              nonProvisionedPendingLines.push({
                externalNumber: '(' + areaCode + ') XXX-XXXX ' + $translate.instant('linesPage.quantity', { count: order.numbers.length }),
                status: order.statusMessage !== 'None' ? $translate.instant('linesPage.inProgress') + ' - ' + order.statusMessage : $translate.instant('linesPage.inProgress'),
                tooltip: PstnService.translateStatusMessage(order),
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
                  lineFound.tooltip = PstnService.translateStatusMessage(order);
                  pendingLines.push(lineFound);
                } else {
                  nonProvisionedPendingLines.push({
                    externalNumber: number.number,
                    status: order.statusMessage !== 'None' ? $translate.instant('linesPage.inProgress') + ' - ' + order.statusMessage : $translate.instant('linesPage.inProgress'),
                    tooltip: PstnService.translateStatusMessage(order),
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
    function getVendor() {
      return vendor;
    }

    function getCarrierName() {
      return carrierName;
    }

    function dedupGrid(newLine, grid) {
      _.remove(grid, function (row) {
        return row.externalNumber === newLine.externalNumber;
      });
    }

    function initToggle() {
      return FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (supported) {
          vm.ishI1484 = supported;
        });
    }

    function exportCSV() {
      // add export code here

      var linesPerPage = Config.usersperpage;
      var sortBy = 'internalnumber';
      var sortOrder = '-asc';
      var searchStr = '';
      var filterType = 'all';
      var deferred = $q.defer();
      var lines = [];
      var page = 0;
      var exportedLines = [];

      initToggle().finally(getLinesInBatches(0));

      function getLinesInBatches(startIndex) {
        getLineList(startIndex, linesPerPage, sortBy, sortOrder, searchStr, filterType)
          .then(function (response) {
            if (response.length > 0) {
              lines = lines.concat(response);
              page++;
              getLinesInBatches((page * 100));
            } else if (response.length <= 0) {
              Log.debug('No more lines returned. Exporting to file.');

              if (lines.length === 0) {
                Log.debug('No lines found.');
                return;
              }
              // header line for CSV file
              var headerLine = {};
              headerLine.internalNumber = $translate.instant('linesPage.headerLabelInternalNumber');
              headerLine.externalNumber = $translate.instant('linesPage.headerLabelExternalNumber');
              headerLine.userId = $translate.instant('linesPage.headerLabelUserId');
              if (vm.ishI1484) {
                headerLine.locationname = $translate.instant('linesPage.headerLabelLocation');
              }
              exportedLines.push(headerLine);

              // data to export for CSV file
              for (var i = 0; i < lines.length; i++) {
                var exportedLine = {};
                if (vm.ishI1484) {
                  exportedLine.internalNumber = lines[i].siteToSiteNumber;
                } else {
                  exportedLine.internalNumber = lines[i].internalNumber;
                }
                exportedLine.externalNumber = lines[i].externalNumber;
                exportedLine.userId = lines[i].userId;
                if (vm.ishI1484) {
                  exportedLine.locationName = lines[i].locationName;
                }
                exportedLines.push(exportedLine);
              } // end of for-loop
              deferred.resolve(exportedLines);
            } else {
              Log.debug('Exporting lines failed.');
              deferred.reject('Exporting lines failed.');
            }
          })
          .catch(function () {
            Log.debug('Query for all lines failed.');
            deferred.reject('Exporting lines failed.');
          });
      } // end of getLinesInBatches
      return deferred.promise;
    } // end of exportCSV
  } // end of function LineListService
})();
