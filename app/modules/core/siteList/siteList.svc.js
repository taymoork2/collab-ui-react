'use strict';

angular.module('Core').service('SiteListService', [
  '$log',
  '$translate',
  'Authinfo',
  'Userservice',
  'Config',
  'WebExApiGatewayService',
  'WebExUtilsFact',

  function (
    $log,
    $translate,
    Authinfo,
    Userservice,
    Config,
    WebExApiGatewayService,
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
                siteHasMCLicense: true
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

              //EC
              var siteEC = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                siteHasECLicense: true
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
                siteHasSCLicense: true
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
                siteHasTCLicense: true
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

              //CMR
              var siteCMR = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                siteHasCMRLicense: true
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

              //EE
              var siteEE = _.where(allSitesWebexLicensesArray, {
                webexSite: siteUrl,
                siteHasEELicense: true
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

              if (count > 1) {
                siteRow.multipleWebexServicesLicensed = true;
                siteRow.licenseTypeContentDisplay = $translate.instant('siteList.multipleLicenses');
                siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay.replace("<br>", "");

              } else {
                siteRow.multipleWebexServicesLicensed = false;
                siteRow.licenseTooltipDisplay = null;
              }

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

    this.updateGrid = function (vm) {
      var funcName = "updateGrid()";
      var logMsg = "";

      // $log.log(funcName);

      // make sure that we have the signed in admin user email before we update the columns
      if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
        updateGridColumns();
      } else {
        Userservice.getUser('me', function (data, status) {
          if (
            (data.success) &&
            (data.emails)
          ) {
            Authinfo.setEmails(data.emails);
            _this.updateGridColumns();
          }
        });
      }

      function updateGridColumns() {
        var funcName = "updateGridColumns()";
        var logMsg = "";

        vm.showGridData = true;
        var gridData = vm.gridData;

        _this.updateLicenseTypesColumn(gridData);

        gridData.forEach(
          function processGrid(siteRow) {
            var funcName = "processGrid()";
            var logMsg = "";

            var siteUrl = siteRow.license.siteUrl;

            siteRow.adminEmailParam = Authinfo.getPrimaryEmail();
            siteRow.userEmailParam = Authinfo.getPrimaryEmail();
            siteRow.advancedSettings = Config.getWebexAdvancedEditUrl(siteUrl);
            siteRow.webexAdvancedUrl = Config.getWebexAdvancedHomeUrl(siteUrl);

            WebExApiGatewayService.isSiteSupportsIframe(siteUrl).then(
              function isSiteSupportsIframeSuccess(result) {
                var funcName = "isSiteSupportsIframeSuccess()";
                var logMsg = "";

                logMsg = funcName + ": " + "\n" +
                  "result=" + JSON.stringify(result);
                $log.log(logMsg);

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
                $log.log(logMsg);

                _this.updateCSVColumn(siteRow);
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
                $log.log(logMsg);
              } // isSiteSupportsIframeError()
            ); // WebExApiGatewayService.isSiteSupportsIframe().then
          } // processGrid()
        ); // vm.gridData.forEach()
      } // updateGridColumns()
    }; // updateGrid()

    this.updateCSVColumn = function (siteRow) {
      if (!siteRow.isCSVSupported) {
        // no further data to get
        siteRow.showCSVInfo = true;
        return;
      }

      // TODO
      var siteUrl = siteRow.license.siteUrl;
      WebExApiGatewayService.csvStatus(siteUrl).then(
        function success(response) {
          var funcName = "WebExApiGatewayService.csvStatus.success()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          siteRow.showCSVInfo = true;
        }, // csvStatusSuccess()

        function error(response) {
          var funcName = "WebExApiGatewayService.csvStatus.error()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          siteRow.showCSVInfo = true;
        } // csvStatusError()
      ); // WebExApiGatewayService.csvStatus(siteUrl).then()
    }; // updateCSVColumn()
  } // end top level function
]);
