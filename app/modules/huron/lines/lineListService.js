(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('LineListService', LineListService);

  /* @ngInject */
  function LineListService($compile, $filter, $http, $q, $rootScope, $timeout, $translate, Config, Log, DidDnListService) {

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
      var filterType = "allLines";
      var deferred = $q.defer();
      var lines = [];
      var page = 0;
      var exportedLines = [];

      getLinesInBatches(1);

      function getLinesInBatches(startIndex) {
        var filter = "";
        if (scope.activeFilter === "unassignedLines") {
          filter = "some_cmi_filter_tbd";
          filterType = "unassignedLines"; // temporary for use with dummy data
        } else if (scope.activeFilter === "assignedLines") {
          filter = "some_cmi_filter_tbd";
          filterType = "assignedLines"; // temporary for use with dummy data
        } else if (scope.activeFilter === "allLines") {
          filter = "some_cmi_filter_tbd";
          filterType = "allLines"; // temporary for use with dummy data
        }

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
              $('#export-icon').html('<i class=\'icon icon-content-share\'></i>'); // switch export icon back to doc icon
              $compile(angular.element('#global-export-btn').html($filter('translate')('organizationsPage.exportBtn')))(scope);
              $rootScope.exporting = false;
              $rootScope.$broadcast('EXPORT_FINISHED');
              if (scope.exportBtn) {
                $('#btncover').hide();
              }

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
          }, function (error) {
            Log.debug('Query for all lines failed.');
            Notification.notify([$translate.instant('linesPage.lineListError')], error);
          });
      } // end of getLinesInBatches

      $('#export-icon').html('<i class=\'icon icon-spinner\'></i>'); // replace export icon with spinner icon
      $compile(angular.element('#global-export-btn').html($filter('translate')('organizationsPage.loadingMsg')))(scope);
      $rootScope.exporting = true;
      if (scope.exportBtn) {
        scope.exportBtn.disabled = true;
        $('#btncover').show();
      }

      return deferred.promise;
    } // end of exportCSV

  } // end of function LineListService
})();
