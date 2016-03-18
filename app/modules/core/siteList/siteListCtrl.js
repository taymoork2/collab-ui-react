(function () {
  'use strict';

  angular.module('Core').controller('SiteListCtrl', SiteListCtrl);

  /*@ngInject*/
  function SiteListCtrl(
    $translate,
    $log,
    $scope,
    $interval,
    Authinfo,
    Userservice,
    SiteListService,
    WebExApiGatewayService,
    Notification
  ) {

    var funcName = "siteListCtrl()";
    var logMsg = "";

    var vm = this;

    vm.showGridData = false;
    vm.gridData = [];
    vm.allSitesWebexLicensesArray = [];

    var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl();

    logMsg = funcName + "\n" +
      "conferenceServices=\n" + JSON.stringify(conferenceServices);
    // $log.log(logMsg);

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

          conferenceService.isIframeSupported = false;
          conferenceService.isAdminReportEnabled = false;
          conferenceService.isCSVSupported = false;

          // define the range of csv states to check
          conferenceService.csvStatusCheckMode = {
            isOn: true, // set this to false to turn off check
            checkStart: 0,
            checkEnd: WebExApiGatewayService.csvStatusTypes.length - 1,
            checkIndex: null
          };

          conferenceService.csvStatusObj = null;

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
      sortable: false,
      width: '30%'
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteSettings',
      displayName: $translate.instant('siteList.siteSettings'),
      cellTemplate: 'modules/core/siteList/siteConfigColumn.tpl.html',
      sortable: false,
      width: '10%'
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteReports',
      displayName: $translate.instant('siteList.siteReports'),
      cellTemplate: 'modules/core/siteList/siteReportsColumn.tpl.html',
      sortable: false,
      width: '10%'
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

    $scope.csvExport = function (siteUrl) {
      var funcName = "csvExport()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;

      Notification.success($translate.instant('siteList.exportStartedToast'));

      $log.log(logMsg);
    }; // csvExport()

    // TODO: remove csvImport() once we start implementing the import modal
    $scope.csvImport = function (siteUrl) {
      var funcName = "csvImport()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;

      Notification.success($translate.instant('siteList.importStartedToast'));

      $log.log(logMsg);
    }; // csvImport()

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
  } // SiteListCtrl()
})(); // top level function
