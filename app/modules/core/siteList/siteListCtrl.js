'use strict';

angular.module('Core')
  .controller('SiteListCtrl', [
    '$translate',
    '$log',
    '$scope',
    '$interval',
    'Authinfo',
    'FeatureToggleService',
    'Userservice',
    'WebExApiGatewayService',
    'WebExUtilsFact',
    'SiteListService',
    function (
      $translate,
      $log,
      $scope,
      $interval,
      Authinfo,
      FeatureToggleService,
      Userservice,
      WebExApiGatewayService,
      WebExUtilsFact,
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

            conferenceService.csvPollTimeout = null;

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

      // TODO - uncomment the following line when feature toggle is no longer used
      // SiteListService.updateGrid(vm);

      // TODO - delete the following lines when feature toggle is no longer used
      // start of delete
      checkCSVToggle();

      // remove the CSV column if admin user doesn't have CSV toggle enabled
      function checkCSVToggle() {
        var funcName = "checkCSVToggle()";
        var logMsg = "";

        $log.log(funcName);

        FeatureToggleService.supports(FeatureToggleService.features.webexCSV).then(
          function getSupportsCSVSuccess(adminUserSupportCSV) {
            var funcName = "getSupportsCSVSuccess()";
            var logMsg = "";

            logMsg = funcName + "\n" +
              "adminUserSupportCSV=" + adminUserSupportCSV;
            $log.log(logMsg);

            // don't show the CSV column if admin user does not have feature toggle
            if (!adminUserSupportCSV) {
              vm.gridOptions.columnDefs.splice(2, 1);
            }

            SiteListService.updateGrid(vm);
          }, // getSupportsCSVSuccess()

          function getSupportsCSVError(result) {
            var funcName = "getSupportsCSVError()";
            var logMsg = "";

            logMsg = funcName + ": " +
              "result=" + JSON.stringify(result);
            $log.log(logMsg);

            // don't show the CSV column if unable to access feature toggle
            vm.gridOptions.columnDefs.splice(2, 1);
            SiteListService.updateGrid(vm);
          } // getSupportsCSVError()
        ); // FeatureToggleService.supports().then()
      } // checkCSVToggle()
      // end of delete

      $scope.$on('$destroy', function () {
        vm.gridData.forEach(
          function cancelCsvPollInterval(siteRow) {
            var funcName = "cancelCsvPollInterval()";
            var logMsg = "";

            if (null != siteRow.csvPollTimeout) {
              logMsg = funcName + "\n" +
                "siteUrl=" + siteRow.license.siteUrl;
              $log.log(logMsg);

              $interval.cancel(siteRow.csvPollTimeout);
            }
          } // cancelCsvPollInterval()
        ); // vm.gridData.forEach()
      });
    } // end top level function
  ]);
