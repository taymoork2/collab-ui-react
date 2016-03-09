'use strict';

angular.module('Core').controller('SiteListCtrl', [
  '$translate',
  '$log',
  '$scope',
  '$interval',
  'Authinfo',
  'Userservice',
  'SiteListService',

  function (
    $translate,
    $log,
    $scope,
    $interval,
    Authinfo,
    Userservice,
    SiteListService
  ) {

    var funcName = "siteListCtrl()";
    var logMsg = "";

    var vm = this;

    vm.showGridData = false;
    vm.gridData = [];
    vm.allSitesWebexLicensesArray = [];

    //getAllSitesLicenseData();

    var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl();

    conferenceServices.forEach(
      function checkConferenceService(conferenceService) {
        var newSiteUrl = conferenceService.license.siteUrl;
        var isNewSiteUrl = true;

        vm.gridData.forEach(
          function checkGrid(siteRow) {
            if (newSiteUrl == siteRow.license.siteUrl) {
              isNewSiteUrl = false;

              logMsg = funcName + ": " + "\n" +
                "Duplicate webex site url detected and skipped." + "\n" +
                "newSiteUrl=" + newSiteUrl;
              $log.log(logMsg);
            }
          }
        );

        if (isNewSiteUrl) {
          logMsg = funcName + "\n" +
            "conferenceService=" + JSON.stringify(conferenceService);
          $log.log(logMsg);

          conferenceService.showCSVInfo = false;
          conferenceService.showSiteLinks = false;
          conferenceService.showLicenseTypes = false;

          conferenceService.isIframeSupported = false;
          conferenceService.isAdminReportEnabled = false;
          conferenceService.isError = false;
          conferenceService.isWarn = false;

          conferenceService.webExSessionTicket = null;
          conferenceService.adminEmailParam = null;
          conferenceService.advancedSettings = null;
          conferenceService.userEmailParam = null;
          conferenceService.webexAdvancedUrl = null;

          conferenceService.csvPollIntervalObj = null;

          conferenceService.checkCsvStatusStart = 1;
          conferenceService.checkCsvStatusEnd = 4;
          conferenceService.checkCsvStatusIndex = conferenceService.checkCsvStatusStart;

          vm.gridData.push(conferenceService);
        }
      }
    );

    // Start of grid set up
    vm.gridOptions = {
      data: 'siteList.gridData',
      multiSelect: false,
      enableRowSelection: false,
      enableColumnMenus: false,
      rowHeight: 44,
      columnDefs: [],
    };

    vm.gridOptions.columnDefs.push({
      field: 'license.siteUrl',
      displayName: $translate.instant('siteList.siteName'),
      sortable: false
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteConfLicenses',
      displayName: $translate.instant('siteList.licenseTypes'),
      cellTemplate: 'modules/core/siteList/siteLicenseTypesColumn.tpl.html',
      sortable: false
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteCSV',
      displayName: $translate.instant('siteList.siteCsvColumnHeader'),
      cellTemplate: 'modules/core/siteList/siteCSVColumn.tpl.html',
      headerCellTemplate: 'modules/core/siteList/siteCSVColumnHeader.tpl.html',
      sortable: false
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteSettings',
      displayName: $translate.instant('siteList.siteSettings'),
      cellTemplate: 'modules/core/siteList/siteListConfigColumn.tpl.html',
      sortable: false
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteReports',
      displayName: $translate.instant('siteList.siteReports'),
      cellTemplate: 'modules/core/siteList/siteListReportsColumn.tpl.html',
      sortable: false
    });

    // make sure that we have the signed in admin user email before we update the columns
    if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
      SiteListService.updateGrid(vm);
    } else {
      Userservice.getUser('me', function (data, status) {
        if (
          (data.success) &&
          (data.emails)
        ) {
          Authinfo.setEmails(data.emails);
          SiteListService.updateGrid(vm);
        }
      });
    }

    function exportClick(siteUrl) {
      $log.log("EXPORT!!!!!  " + siteUrl);
    } // exportClick()

    function exportResultClick(siteUrl) {
      $log.log("EXPORT RESULT!!!!!  " + siteUrl);
    } // exportResultClick()

    function importClick(siteUrl) {
      $log.log("IMPORT!!!!!  " + siteUrl);
    } // importClick()

    function importResultClick(siteUrl) {
      $log.log("IMPORT RESULT!!!!!  " + siteUrl);
    } // importResultClick()
    
    $scope.exportClick = exportClick;
    $scope.exportResultClick = exportResultClick;
    $scope.importClick = importClick;
    $scope.importResultClick = importResultClick;

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      vm.gridData.forEach(
        function cancelCsvPollInterval(siteRow) {
          var funcName = "cancelCsvPollInterval()";
          var logMsg = "";

          if (null != siteRow.csvPollIntervalObj) {
            logMsg = funcName + "\n" +
              "siteUrl=" + siteRow.license.siteUrl;
            $log.log(logMsg);

            $interval.cancel(siteRow.csvPollIntervalObj);
          }
        } // cancelCsvPollInterval()
      ); // vm.gridData.forEach()
    });
  } // end top level function
]);
