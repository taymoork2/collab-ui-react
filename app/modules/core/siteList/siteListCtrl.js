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

    var funcName = "SiteListCtrl()";
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

          // define the range of csv states to mock
          // list of states are in the file apiGatewayConsts.svc.js
          conferenceService.csvMock = {
            mockExport: false,
            mockImport: false,
            mockFileDownload: false,
            mockStatus: false,

            // change mockStatusStartIndex and mockStatusEndIndex to mock specific csv state(s)
            // reference WebExApiGatewayConstsService.csvStatusTypes to know which index value is for which status 
            mockStatusStartIndex: 0,
            mockStatusEndIndex: 0,
            mockStatusCurrentIndex: null,
          };

          conferenceService.csvStatusObj = null;
          conferenceService.csvPollIntervalObj = null;

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
      field: 'siteActions',
      displayName: $translate.instant('siteList.siteActions'),
      cellTemplate: 'modules/core/siteList/siteActionsColumn.tpl.html',
      sortable: false,
      width: '27%'
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteCSV',
      displayName: $translate.instant('siteList.siteCsvColumnHeader'),
      cellTemplate: 'modules/core/siteList/siteCSVColumn.tpl.html',
      headerCellTemplate: 'modules/core/siteList/siteCSVColumnHeader.tpl.html',
      sortable: false,
      width: '22%'
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteSettings',
      displayName: $translate.instant('siteList.siteSettings'),
      cellTemplate: 'modules/core/siteList/siteConfigColumn.tpl.html',
      sortable: false,
      width: '9%'
    });

    vm.gridOptions.columnDefs.push({
      field: 'siteReports',
      displayName: $translate.instant('siteList.siteReports'),
      cellTemplate: 'modules/core/siteList/siteReportsColumn.tpl.html',
      sortable: false,
      width: '9%'
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

    $scope.csvExport = function (siteRow) {
      var funcName = "csvExport()";
      var logMsg = "";
      var siteUrl = siteRow.license.siteUrl;

      logMsg = funcName + "\n" +
        "siteRow=" + JSON.stringify(siteRow);
      //$log.log(logMsg);

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      //$log.log(logMsg);

      WebExApiGatewayService.csvExport(
        siteUrl,
        siteRow.csvMock.mockExport
      ).then(

        function success(response) {
          var funcName = "WebExApiGatewayService.csvExport.success()";
          var logMsg = "";

          $log.log(logMsg);

          Notification.success($translate.instant('siteList.exportStartedToast'));
          SiteListService.updateCSVColumnInRow(siteRow);
        },

        function error(response) {
          var funcName = "WebExApiGatewayService.csvExport.error()";
          var logMsg = "";

          $log.log(logMsg);

          //TBD: Actual error result handling
          Notification.error($translate.instant('siteList.exportRejectedToast'));
        }
      ).catch(
        function catchError(response) {
          var funcName = "WebExApiGatewayService.csvExport.catchError()";
          var logMsg = "";

          $log.log(logMsg);

          Notification.error($translate.instant('siteList.exportRejectedToast'));
          SiteListService.updateCSVColumnInRow(siteRow);
        }
      ); // WebExApiGatewayService.csvExport()

    }; // csvExport()

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
