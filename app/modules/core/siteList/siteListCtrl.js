'use strict';

angular.module('Core')
  .controller('SiteListCtrl', [
    '$translate',
    'Authinfo',
    'Config',
    '$log',
    'FeatureToggleService',
    'Userservice',
    'WebExApiGatewayService',
    'Orgservice',
    'WebExUtilsFact',
    function (
      $translate,
      Authinfo,
      Config,
      $log,
      FeatureToggleService,
      Userservice,
      WebExApiGatewayService,
      Orgservice,
      WebExUtilsFact
    ) {
      var funcName = "siteListCtrl()";
      var logMsg = "";

      var vm = this;
      vm.gridData = [];
      vm.allSitesWebexLicensesArray = [];

      var adminUserSupportCSV = false; // TODO

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
            conferenceService.isIframeSupported = false;
            conferenceService.isAdminReportEnabled = false;
            conferenceService.isError = false;
            conferenceService.isWarn = false;

            conferenceService.webExSessionTicket = null;
            conferenceService.adminEmailParam = null;
            conferenceService.advancedSettings = null;
            conferenceService.userEmailParam = null;
            conferenceService.webexAdvancedUrl = null;

            vm.gridData.push(conferenceService);
          }
        }
      );

      getAllSitesLicenseData();

      // Start of grid set up
      var siteCsvColumnHeaderTemplate = "\n" +
        '<div class="ui-grid-cell-contents ui-grid-header-cell-primary-focus" col-index="renderIndex" tabindex="0" role="button">' + '\n' +
        '  <div>' + '\n' +
        '    <span id="id-siteCsvColumnHeader" class="ui-grid-header-cell-label ng-binding" translate="siteList.siteCsvColumnHeader"></span>' + '\n' +
        '    <span id="id-userAttributesTooltipIcon" class="icon icon-information icon-lg ng-scope" tooltip-append-to-body="true" tooltip-animation="false" tooltip="{{::\'siteList.userAttributesTooltip\' | translate}}" tooltip-placement="right" ></span>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      var siteCSVColumn = "\n" +
        '<div ng-if="!row.entity.showCSVInfo">' + '\n' +
        '  <p class="ui-grid-cell-contents">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="row.entity.showCSVInfo">' + '\n' +
        '  <div ng-if="!row.entity.isCSVSupported">' + '\n' +
        '    <p class="ui-grid-cell-contents" translate>' + '\n' +
        '      siteList.siteCSVNotAvailable' + '\n' +
        '    </p>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isCSVSupported">' + '\n' +
        '    <p class="ui-grid-cell-contents">' + '\n' +
        '      <a><span id="{{row.entity.license.siteUrl}}_xlaunch-export-users" translate="siteList.siteCsvExportLinkLabel"></span></a>' + '   |   ' + '<a><span id="{{row.entity.license.siteUrl}}_xlaunch-import-users" translate="siteList.siteCsvImportLinkLabel"></span></a>' + '\n' +
        '    </p>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      var siteConfigColumn =
        '<div ng-if="!row.entity.showSiteLinks">' + '\n' +
        '  <p class="ui-grid-cell-contents">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="row.entity.showSiteLinks">' + '\n' +
        '  <div ng-if="!row.entity.isIframeSupported && !row.entity.isError">' + '\n' +
        '    <launch-site admin-email-param={{row.entity.adminEmailParam}}' + '\n' +
        '                 advanced-settings={{row.entity.advancedSettings}}' + '\n' +
        '                 user-email-param={{row.entity.userEmailParam}}' + '\n' +
        '                 webex-advanced-url={{row.entity.webexAdvancedUrl}}' + '\n' +
        '                 id = {{row.entity.license.siteUrl}}_xlaunch-webex-site-settings' + '\n' +
        '                 name={{row.entity.license.siteUrl}}_xlaunch-webex-site-settings>' + '\n' +
        '    </launch-site>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isIframeSupported && !row.entity.isError">' + '\n' +
        '    <a id="{{row.entity.license.siteUrl}}_webex-site-settings"' + '\n' +
        '       name="{{row.entity.license.siteUrl}}_webex-site-settings"' + '\n' +
        '       ui-sref="site-list.site-settings({siteUrl:row.entity.license.siteUrl})">' + '\n' +
        '      <p class="ui-grid-cell-contents">' + '\n' +
        '        <i class="icon-settings icon"></i>' + '\n' +
        '      </p>' + '\n' +
        '    </a>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isError && !row.entity.isWarn" popover="{{\'siteList.systemError\' | translate}}" popover-trigger="mouseenter" popover-placement="bottom">' + '\n' +
        '      <p class="ui-grid-cell-contents">' + '\n' +
        '        <i class="icon-error icon err webex-alert-text"></i>' + '\n' +
        '      </p>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isWarn" popover="{{\'siteList.authError\' | translate}}" popover-trigger="mouseenter" popover-placement="bottom">' + '\n' +
        '      <p class="ui-grid-cell-contents">' + '\n' +
        '        <i class="icon-warning icon webex-attention-text"></i>' + '\n' +
        '      </p>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      var siteReportsColumn =
        '<div ng-if="!row.entity.showSiteLinks">' + '\n' +
        '  <p class="ui-grid-cell-contents">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="row.entity.showSiteLinks">' + '\n' +
        '  <div ng-if="row.entity.isAdminReportEnabled">' + '\n' +
        '    <div ng-if="!row.entity.isIframeSupported">' + '\n' +
        '      <launch-site admin-email-param={{row.entity.adminEmailParam}}' + '\n' +
        '                   advanced-settings={{row.entity.advancedSettings}}' + '\n' +
        '                   user-email-param={{row.entity.userEmailParam}}' + '\n' +
        '                   webex-advanced-url={{row.entity.webexAdvancedUrl}}' + '\n' +
        '                   id={{row.entity.license.siteUrl}}_xlaunch-webex-site-reports' + '\n' +
        '                   name={{row.entity.license.siteUrl}}_xlaunch-webex-site-reports>' + '\n' +
        '      </launch-site>' + '\n' +
        '    </div>' + '\n' +
        '    <div ng-if="row.entity.isIframeSupported">' + '\n' +
        '       <a id="{{row.entity.license.siteUrl}}_webex-site-reports"' + '\n' +
        '          name="{{row.entity.license.siteUrl}}_webex-site-reports"' + '\n' +
        '          ui-sref="webex-reports({siteUrl:row.entity.license.siteUrl})"> ' + '\n' +
        '        <p class="ui-grid-cell-contents">' + '\n' +
        '          <i class="icon-settings icon"></i>' + '\n' +
        '        </p>' + '\n' +
        '       </a>' + '\n' +
        '    </div>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isError && !row.entity.isWarn" popover="{{\'siteList.systemError\' | translate}}" popover-trigger="mouseenter" popover-placement="bottom">' + '\n' +
        '      <p class="ui-grid-cell-contents">' + '\n' +
        '        <i class="icon-error icon err webex-alert-text"></i>' + '\n' +
        '      </p>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isWarn" popover="{{\'siteList.authError\' | translate}}" popover-trigger="mouseenter" popover-placement="bottom">' + '\n' +
        '      <p class="ui-grid-cell-contents">' + '\n' +
        '        <i class="icon-warning icon webex-attention-text"></i>' + '\n' +
        '      </p>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

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
        field: 'license.capacity',
        displayName: $translate.instant('siteList.licenseTypes'),
        //cellFilter: 'capacityFilter:row.entity.label',
        cellTemplate: 'modules/core/siteList/siteLicenseTypes.tpl.html',
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'siteSettings',
        displayName: $translate.instant('siteList.siteSettings'),
        cellTemplate: siteConfigColumn,
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'siteReports',
        displayName: $translate.instant('siteList.siteReports'),
        cellTemplate: siteReportsColumn,
        sortable: false
      });

      var allowCSVToAllAdmins = false; // TODO
      if (!allowCSVToAllAdmins) {
        checkCSVToggle();
      } else {
        insertCSVColumn();
        updateGrid();
      }

      //updateGridForLicense();

      function checkCSVToggle() {
        FeatureToggleService.supports(FeatureToggleService.features.webexCSV).then(
          function getSupportsCSVSuccess(result) {
            var funcName = "getSupportsCSVSuccess()";
            var logMsg = "";

            adminUserSupportCSV = result;
            if (adminUserSupportCSV) {
              insertCSVColumn();
            }

            updateGrid();
          }, // getSupportsCSVSuccess()

          function getSupportsCSVError(result) {
            var funcName = "getSupportsCSVError()";
            var logMsg = "";

            logMsg = funcName + ": " +
              "result=" + JSON.stringify(result);
            $log.log(logMsg);

            updateGrid();
          } // getSupportsCSVError()
        ); // FeatureToggleService.supports().then()
      } // checkCSVToggle()

      function insertCSVColumn() {
        var columnObj = {
          field: 'siteCSV',
          displayName: $translate.instant('siteList.siteCsv'),
          cellTemplate: siteCSVColumn,
          headerCellTemplate: siteCsvColumnHeaderTemplate,
          sortable: false
        };

        vm.gridOptions.columnDefs.splice(
          3,
          0,
          columnObj
        );
      } // insertCSVColumn()
      // End of grid set up

      function updateGrid() {
        var funcName = "updateGrid()";
        var logMsg = "";

        // $log.log(funcName);

        if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
          initGridColumns();
        } else {
          Userservice.getUser('me', function (data, status) {
            if (
              (data.success) &&
              (data.emails)
            ) {
              Authinfo.setEmails(data.emails);
              initGridColumns();
            }
          });
        }
      } // updateGrid()

      function updateGridForLicense() {
        //Update the grid data with license information for each site
        var funcName = "updateGridForLicense()";
        var logMsg = "";

        // $log.log(funcName);

        vm.gridData.forEach(
          function processGridForLicense(siteRow) {
            var funcName = "processGridForLicense()";
            var logMsg = "";
            var siteUrl = siteRow.license.siteUrl;
            var count = 0;

            //Get the site's MC, EC, SC, TC, CMR license information
            //MC
            var siteMC = _.where(vm.allSitesWebexLicensesArray, {
              webexSite: siteUrl,
              siteHasMCLicense: true
            });

            if (siteMC != null && siteMC.length > 0) {
              siteRow.MCLicensed = true;
              siteRow.licenseTooltipDisplay = "";

              siteMC.forEach(
                function processDisplayText(mc) {
                  //Grid content display
                  siteRow.licenseTypeContentDisplay = $translate.instant('helpdesk.licenseDisplayNames.' + mc.offerCode, {
                    capacity: mc.capacity
                  });
                  //Tooltip display
                  siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "\n" + $translate.instant('helpdesk.licenseDisplayNames.' + mc.offerCode, {
                    capacity: mc.capacity
                  });
                  count++;
                }
              ); //siteMC.forEach

            } else {
              siteRow.MCLicensed = false;
            }

            //EC
            var siteEC = _.where(vm.allSitesWebexLicensesArray, {
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
                  siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "\n" + $translate.instant('helpdesk.licenseDisplayNames.' + ec.offerCode, {
                    capacity: ec.capacity
                  });
                  count++;
                }
              ); //siteEC.forEach

            } else {
              siteRow.ECLicensed = false;
            }

            //SC
            var siteSC = _.where(vm.allSitesWebexLicensesArray, {
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
                  siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "\n" + $translate.instant('helpdesk.licenseDisplayNames.' + sc.offerCode, {
                    capacity: sc.capacity
                  });
                  count++;
                }
              ); //siteSC.forEach

            } else {
              siteRow.SCLicensed = false;
            }

            //TC
            var siteTC = _.where(vm.allSitesWebexLicensesArray, {
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
                  siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "\n" + $translate.instant('helpdesk.licenseDisplayNames.' + tc.offerCode, {
                    capacity: tc.capacity
                  });
                  count++;
                }
              ); //siteTC.forEach

            } else {
              siteRow.TCLicensed = false;
            }

            //CMR
            var siteCMR = _.where(vm.allSitesWebexLicensesArray, {
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
                  siteRow.licenseTooltipDisplay = siteRow.licenseTooltipDisplay + "\n" + $translate.instant('helpdesk.licenseDisplayNames.' + cmr.offerCode, {
                    capacity: cmr.capacity
                  });
                  count++;
                }
              ); //siteCMR.forEach

            } else {
              siteRow.CMRLicensed = false;
            }

            if (count > 1) {
              siteRow.multipleWebexServicesLicensed = true;
              siteRow.licenseTypeContentDisplay = $translate.instant('siteList.multipleLicenses');

            } else {
              siteRow.multipleWebexServicesLicensed = false;
            }

          } //processGrid()
        ); // vm.gridData.forEach()

      } //updateGridForLicense

      function getAllSitesLicenseData() {
        var funcName = "getAllSitesLicenseData()";
        var logMsg = "";

        WebExUtilsFact.getAllSitesWebexLicenseInfo().then(
          function getWebexLicenseInfoSuccess(allSitesLicenseInfo) {
            var funcName = "getWebexLicenseInfoSuccess()";
            var logMsg = "";

            logMsg = funcName + ": " + "\n" +
              "allSitesLicenseInfo=" + JSON.stringify(allSitesLicenseInfo);

            vm.allSitesWebexLicensesArray = allSitesLicenseInfo;
            updateGridForLicense();

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

      } //getAllSitesLicenseData()

      function initGridColumns() {
        var funcName = "initGridColumns()";
        var logMsg = "";

        vm.gridData.forEach(
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

                updateCSVColumn(siteRow);

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
      } // initGridColumns()

      function updateCSVColumn(siteRow) {
        if (!siteRow.isCSVSupported) {
          // no further data to get
          siteRow.showCSVInfo = true;
          return;
        }

        // TODO
        var siteUrl = siteRow.license.siteUrl;
        WebExApiGatewayService.csvStatus(siteUrl).then(
          function getCSVStatusSuccess(response) {
            var funcName = "getCSVStatusSuccess()";
            var logMsg = "";

            logMsg = funcName + "\n" +
              "response=" + JSON.stringify(response);
            $log.log(logMsg);

            siteRow.showCSVInfo = true;
          }, // getCSVStatusSuccess()

          function getCSVStatusError(response) {
            var funcName = "getCSVStatusError()";
            var logMsg = "";

            logMsg = funcName + "\n" +
              "response=" + JSON.stringify(response);
            $log.log(logMsg);

            siteRow.showCSVInfo = true;
          } // getCSVStatusSuccess()
        );
      } // updateCSVColumn()

    } // End controller

  ]);
