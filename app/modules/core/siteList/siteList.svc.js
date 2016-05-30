(function () {
  'use strict';

  angular.module('Core').service('SiteListService', SiteListService);

  /* @ngInject */
  function SiteListService(
    $log,
    $translate,
    $interval,
    Authinfo,
    UrlConfig,
    FeatureToggleService,
    WebExApiGatewayService,
    WebExApiGatewayConstsService,
    WebExUtilsFact
  ) {

    var _this = this;

    this.updateLicenseTypesColumn = function (siteListGridData) {
      var funcName = "updateLicenseTypesColumn()";
      var logMsg = "";

      WebExUtilsFact.getAllSitesWebexLicenseInfo().then(
        function getWebexLicenseInfoSuccess(allSitesLicenseInfo) {
          var funcName = "getWebexLicenseInfoSuccess()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "allSitesLicenseInfo=" + JSON.stringify(allSitesLicenseInfo);
          $log.log(logMsg);

          var allSitesWebexLicensesArray = allSitesLicenseInfo;

          siteListGridData.forEach(
            function processGridForLicense(siteRow) {
              var funcName = "processGridForLicense()";
              var logMsg = "";
              var siteUrl = siteRow.license.siteUrl;
              var count = 0;
              siteRow.licenseTooltipDisplay = "";

              //Get the site's MC, EC, SC, TC, CMR license information
              //MC
              var siteMC = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                offerCode: "MC"
              });

              if (siteMC != null && siteMC.length > 0) {
                siteRow.MCLicensed = true;

                siteMC.forEach(
                  function processDisplayText(mc) {
                    //Grid content display
                    siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + mc.offerCode, {
                      capacity: mc.capacity
                    });
                    //Tooltip display
                    siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "<br>" + $translate.instant('helpdesk.licenseDisplayNames.' + mc.offerCode, {
                      capacity: mc.capacity
                    });
                    count++;
                  }
                ); //siteMC.forEach

              } else {
                siteRow.MCLicensed = false;
              }

              //EE
              var siteEE = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                offerCode: "EE"
              });

              if (siteEE != null && siteEE.length > 0) {
                siteRow.EELicensed = true;

                siteEE.forEach(
                  function processDisplayText(ee) {
                    //Grid content display
                    siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + ee.offerCode, {
                      capacity: ee.capacity
                    });
                    //Tooltip display
                    siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "<br>" + $translate.instant('helpdesk.licenseDisplayNames.' + ee.offerCode, {
                      capacity: ee.capacity
                    });
                    count++;
                  }
                ); //siteEE.forEach

              } else {
                siteRow.EELicensed = false;
              }

              //CMR
              var siteCMR = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                offerCode: "CMR"
              });

              if (siteCMR != null && siteCMR.length > 0) {
                siteRow.CMRLicensed = true;

                siteCMR.forEach(
                  function processDisplayText(cmr) {
                    //Grid content display
                    siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + cmr.offerCode, {
                      capacity: cmr.capacity
                    });
                    //Tooltip display
                    siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "<br>" + $translate.instant('helpdesk.licenseDisplayNames.' + cmr.offerCode, {
                      capacity: cmr.capacity
                    });
                    count++;
                  }
                ); //siteCMR.forEach

              } else {
                siteRow.CMRLicensed = false;
              }

              //EC
              var siteEC = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                offerCode: "EC"
              });

              if (siteEC != null && siteEC.length > 0) {
                siteRow.ECLicensed = true;

                siteEC.forEach(
                  function processDisplayText(ec) {
                    //Grid content display
                    siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + ec.offerCode, {
                      capacity: ec.capacity
                    });
                    //Tooltip display
                    siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "<br>" + $translate.instant('helpdesk.licenseDisplayNames.' + ec.offerCode, {
                      capacity: ec.capacity
                    });
                    count++;
                  }
                ); //siteEC.forEach

              } else {
                siteRow.ECLicensed = false;
              }

              //SC
              var siteSC = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                offerCode: "SC"
              });

              if (siteSC != null && siteSC.length > 0) {
                siteRow.SCLicensed = true;

                siteSC.forEach(
                  function processDisplayText(sc) {
                    //Grid content display
                    siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + sc.offerCode, {
                      capacity: sc.capacity
                    });
                    //Tooltip display
                    siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "<br>" + $translate.instant('helpdesk.licenseDisplayNames.' + sc.offerCode, {
                      capacity: sc.capacity
                    });
                    count++;
                  }
                ); //siteSC.forEach

              } else {
                siteRow.SCLicensed = false;
              }

              //TC
              var siteTC = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                offerCode: "TC"
              });

              if (siteTC != null && siteTC.length > 0) {
                siteRow.TCLicensed = true;

                siteTC.forEach(
                  function processDisplayText(tc) {
                    //Grid content display
                    siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + tc.offerCode, {
                      capacity: tc.capacity
                    });
                    //Tooltip display
                    siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "<br>" + $translate.instant('helpdesk.licenseDisplayNames.' + tc.offerCode, {
                      capacity: tc.capacity
                    });
                    count++;
                  }
                ); //siteTC.forEach

              } else {
                siteRow.TCLicensed = false;
              }

              if (count > 1) {
                siteRow.multipleWebexServicesLicensed = true;
                siteRow.licenseTypeContentDisplay = $translate.instant('siteList.multipleLicenses');
                siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay.replace("<br>", "");

              } else {
                siteRow.multipleWebexServicesLicensed = false;
                siteRow.licenseTooltipDisplay = null;
              }

              logMsg = funcName + ": " + "\n" +
                "siteRow=" + JSON.stringify(siteRow);
              $log.log(logMsg);

              siteRow.showLicenseTypes = true;
            } // processGridForLicense()
          ); // siteListGridData.forEach()

          // $log.log(logMsg);
        }, // getWebexLicenseInfoSuccess()

        function getWebexLicenseInfoError(result) {
          var funcName = "getWebexLicenseInfoError()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "result=" + JSON.stringify(result);
          $log.log(logMsg);
        } // getWebexLicenseInfoError()
      ); //getWebexLicenseInfo.then()
    }; //updateLicenseTypesColumn()

    this.updateWebExDataColumns = function (gridData) {
      var funcName = "updateWebExDataColumns()";
      var logMsg = "";

      gridData.forEach(
        function processSiteRow(siteRow) {
          var funcName = "processSiteRow()";
          var logMsg = "";

          _this.updateWebExColumnsInRow(siteRow);
        } // processSiteRow()
      ); // gridData.forEach()
    }; // updateWebExDataColumns()

    this.updateWebExColumnsInRow = function (siteRow) {
      var funcName = "updateWebExColumnsInRow()";
      var logMsg = "";

      var siteUrl = siteRow.license.siteUrl;

      siteRow.adminEmailParam = Authinfo.getPrimaryEmail();
      siteRow.userEmailParam = Authinfo.getPrimaryEmail();
      siteRow.advancedSettings = UrlConfig.getWebexAdvancedEditUrl(siteUrl);
      siteRow.webexAdvancedUrl = UrlConfig.getWebexAdvancedHomeUrl(siteUrl);

      WebExApiGatewayService.isSiteSupportsIframe(siteUrl).then(
        function isSiteSupportsIframeSuccess(result) {
          var funcName = "isSiteSupportsIframeSuccess()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "result=" + JSON.stringify(result);
          // $log.log(logMsg);

          siteRow.isIframeSupported = result.isIframeSupported;
          siteRow.isAdminReportEnabled = result.isAdminReportEnabled;
          siteRow.isCSVSupported = result.isCSVSupported;

          siteRow.showSiteLinks = true;

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "siteRow.isCSVSupported=" + siteRow.isCSVSupported + "\n" +
            "siteRow.isIframeSupported=" + siteRow.isIframeSupported + "\n" +
            "siteRow.isAdminReportEnabled=" + siteRow.isAdminReportEnabled + "\n" +
            "siteRow.showSiteLinks=" + siteRow.showSiteLinks;
          // $log.log(logMsg);

          if (
            (!siteRow.isCSVSupported) ||
            (!siteRow.showCSVIconAndResults)
          ) {

            // no further data to get
            siteRow.showCSVInfo = true;
            return;
          }

          _this.updateCSVStatusInRow(siteRow);

          // start CSV status poll
          // var pollInterval = 3600000; // 1hr
          var pollInterval = 30000; // 30sec
          // var pollInterval = 15000; // 15sec
          siteRow.csvPollIntervalObj = $interval(
            function () {
              _this.updateCSVStatusInRow(siteRow);
            },

            pollInterval
          );
        }, // isSiteSupportsIframeSuccess()

        function isSiteSupportsIframeError(response) {
          var funcName = "isSiteSupportsIframeError()";
          var logMsg = "";

          siteRow.isIframeSupported = false;
          siteRow.isAdminReportEnabled = false;
          siteRow.showSiteLinks = true;
          siteRow.showCSVInfo = true;
          siteRow.isError = true;

          if (response.response.indexOf("030048") != -1) {
            siteRow.isWarn = true;
          }

          logMsg = funcName + ": " + "\n" +
            "response=" + JSON.stringify(response);
          // $log.log(logMsg);
        } // isSiteSupportsIframeError()
      ); // WebExApiGatewayService.isSiteSupportsIframe().then
    }; // updateWebExColumnsInRow()

    this.updateDisplayControlFlagsInRow = function (siteRow) {

      var funcName = "updateDisplayControlFlagsInRow()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteRow.csvStatusObj=" + "\n" + JSON.stringify(siteRow.csvStatusObj);
      // $log.log(logMsg);

      //initialize display control flags
      siteRow.showCSVInfo = true;

      siteRow.showExportLink = false;
      siteRow.showExportInProgressLink = false;
      siteRow.grayedExportLink = false;
      siteRow.showExportResultsLink = false;
      siteRow.exportFinishedWithErrors = false;

      siteRow.showImportLink = false;
      siteRow.showImportInProgressLink = false;
      siteRow.grayedImportLink = false;
      siteRow.showImportResultsLink = false;
      siteRow.importFinishedWithErrors = false;

      if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.none) {

        siteRow.showExportLink = true;

        siteRow.showImportLink = true;

      } else if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.exportInProgress) {

        siteRow.showExportInProgressLink = true;

        siteRow.grayedImportLink = true;

      } else if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.exportCompletedNoErr) {

        siteRow.showExportLink = true;
        siteRow.showExportResultsLink = true;

        siteRow.showImportLink = true;

      } else if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.exportCompletedWithErr) {

        siteRow.showExportLink = true;
        siteRow.showExportResultsLink = true;
        siteRow.exportFinishedWithErrors = true;

        siteRow.showImportLink = true;

      } else if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.importInProgress) {

        siteRow.showImportInProgressLink = true;

        siteRow.grayedExportLink = true;

      } else if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.importCompletedNoErr) {

        siteRow.showExportLink = true;

        siteRow.showImportLink = true;
        siteRow.showImportResultsLink = true;

      } else if (siteRow.csvStatusObj.status == WebExApiGatewayConstsService.csvStates.importCompletedWithErr) {

        siteRow.showExportLink = true;

        siteRow.showImportLink = true;
        siteRow.showImportResultsLink = true;
        siteRow.importFinishedWithErrors = true;

      }

      siteRow.showCSVInfo = true;
    }; //updateDisplayControlFlagsInRow()

    this.updateCSVStatusInRow = function (siteRow) {
      var funcName = "updateCSVStatusInRow()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteRow=" + "\n" + JSON.stringify(siteRow);
      // $log.log(logMsg);

      var siteUrl = siteRow.license.siteUrl;
      var mockCsvStatusReq = null;

      if (
        (null != siteRow.csvMock) &&
        (siteRow.csvMock.mockStatus)
      ) {

        if (null == siteRow.csvMock.mockStatusCurrentIndex) {
          siteRow.csvMock.mockStatusCurrentIndex = siteRow.csvMock.mockStatusStartIndex;
        }

        mockCsvStatusReq = WebExApiGatewayConstsService.csvStatusTypes[siteRow.csvMock.mockStatusCurrentIndex];

        logMsg = funcName + "\n" +
          "mockStatusCurrentIndex=" + siteRow.csvMock.mockStatusCurrentIndex + "\n" +
          "mockCsvStatusReq=" + mockCsvStatusReq;
        // $log.log(logMsg);

        ++siteRow.csvMock.mockStatusCurrentIndex;

        if (
          (WebExApiGatewayConstsService.csvStatusTypes.length <= siteRow.csvMock.mockStatusCurrentIndex) ||
          (siteRow.csvMock.mockStatusEndIndex < siteRow.csvMock.mockStatusCurrentIndex)
        ) {

          siteRow.csvMock.mockStatusCurrentIndex = siteRow.csvMock.mockStatusStartIndex;
        }
      }

      WebExApiGatewayService.csvStatus(
        siteUrl,
        siteRow.csvMock.mockStatus,
        mockCsvStatusReq
      ).then(

        function success(response) {
          var funcName = "WebExApiGatewayService.csvStatus.success()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "response=" + JSON.stringify(response);
          // $log.log(logMsg);

          // save the response obj into the siteRow obj... when get result (for completed job) is clicked,
          // we will need  more information from the response obj
          siteRow.csvStatusObj = response;
          siteRow.asyncErr = false;

          _this.updateDisplayControlFlagsInRow(siteRow);
        }, // csvStatusSuccess()

        function error(response) {
          var funcName = "WebExApiGatewayService.csvStatus.error()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          siteRow.csvStatusObj = response;
          siteRow.asyncErr = true;

          _this.updateDisplayControlFlagsInRow(siteRow);

          siteRow.showCSVInfo = false;
        } // csvStatusError()
      ); // WebExApiGatewayService.csvStatus(siteUrl).then()
    }; // updateCSVStatusInRow()

    this.updateGrid = function (vm) {
      var funcName = "updateGrid()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "vm=" + JSON.stringify(vm);
      // $log.log(logMsg);

      // remove grid column(s) based on feature toggles
      FeatureToggleService.supports(FeatureToggleService.features.webexCSV).then(
        function checkWebExFeaturToggleSuccess(adminUserSupportCSV) {
          var funcName = "checkWebExFeaturToggleSuccess()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "adminUserSupportCSV=" + adminUserSupportCSV;
          // $log.log(logMsg);

          // Start of hide CSV info if admin user does not have feature toggle
          vm.gridData.forEach(
            function processSiteRow(siteRow) {
              var funcName = "checkWebExFeaturToggleSuccess().processSiteRow()";
              var logMsg = "";

              siteRow.showCSVIconAndResults = adminUserSupportCSV;
            } // processSiteRow()
          ); // gridData.forEach()

          if (!adminUserSupportCSV) {
            vm.gridOptions.columnDefs.splice(3, 1);
          }
          // End of hiding CSV info if admin user does not have feature toggle

          /*
          // delete the Actions column if admin user does not have feature toggle
          if (!adminUserSupportCSV) {
            vm.gridOptions.columnDefs.splice(2, 1);
          }
          */

          updateGridColumns();
        }, // checkWebExFeaturToggleSuccess()

        function checkWebExFeaturToggleError(response) {
          var funcName = "checkWebExFeaturToggleError()";
          var logMsg = "";

          $log.log(funcName);

          // don't show the CSV column
          vm.gridOptions.columnDefs.splice(2, 1);

          updateGridColumns();
        } // checkWebExFeaturToggleError()
      ); // FeatureToggleService.supports().then()

      function updateGridColumns() {
        var funcName = "updateGridColumns()";
        var logMsg = "";

        vm.showGridData = true;
        var gridData = vm.gridData;

        _this.updateLicenseTypesColumn(gridData);
        _this.updateWebExDataColumns(gridData);
      } // updateGridColumns()
    }; // updateGrid()
  } // end top level function
})();
