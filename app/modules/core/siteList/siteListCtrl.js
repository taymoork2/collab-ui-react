'use strict';

angular.module('Core')
  .controller('SiteListCtrl', [
    '$translate',
    '$log',
    'Authinfo',
    'FeatureToggleService',
    'WebExUtilsFact',
    'SiteListService',
    function (
      $translate,
      $log,
      Authinfo,
      FeatureToggleService,
      WebExUtilsFact,
      SiteListService
    ) {
      var funcName = "siteListCtrl()";
      var logMsg = "";

      var vm = this;
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
        field: 'siteConfLicenses',
        displayName: $translate.instant('siteList.licenseTypes'),
        //cellFilter: 'capacityFilter:row.entity.label',
        cellTemplate: 'modules/core/siteList/siteLicenseTypes.tpl.html',
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'siteCSV',
        displayName: $translate.instant('siteList.siteCsv'),
        cellTemplate: siteCSVColumn,
        headerCellTemplate: siteCsvColumnHeaderTemplate,
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

      //Update grid with site license information
      vm.gridData = SiteListService.getAllSitesLicenseData(vm.gridData);

      // TODO - uncomment the following line when feature toggle is no longer used
      // SiteListService.updateGrid(vm.gridData);

      // TODO - delete the following lines when feature toggle is no longer used
      checkCSVToggle();

      function checkCSVToggle() {
        FeatureToggleService.supports(FeatureToggleService.features.webexCSV).then(
          function getSupportsCSVSuccess(adminUserSupportCSV) {
            var funcName = "getSupportsCSVSuccess()";
            var logMsg = "";

            if (!adminUserSupportCSV) {
              vm.gridOptions.columnDefs.splice(2, 1);
            }

            SiteListService.updateGrid(vm.gridData);
          }, // getSupportsCSVSuccess()

          function getSupportsCSVError(result) {
            var funcName = "getSupportsCSVError()";
            var logMsg = "";

            logMsg = funcName + ": " +
              "result=" + JSON.stringify(result);
            $log.log(logMsg);

            vm.gridOptions.columnDefs.splice(2, 1);
            SiteListService.updateGrid(vm.gridData);
          } // getSupportsCSVError()
        ); // FeatureToggleService.supports().then()
      } // checkCSVToggle()
      // End of delete
      // End of grid set up
    } // End controller
  ]);
