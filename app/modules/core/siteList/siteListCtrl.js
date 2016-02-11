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
    function (
      $translate,
      Authinfo,
      Config,
      $log,
      FeatureToggleService,
      Userservice,
      WebExApiGatewayService
    ) {
      var funcName = "siteListCtrl()";
      var logMsg = "";

      var vm = this;
      vm.gridData = [];

      var adminUserSupportCSV = false; // TODO

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
        '  <div ng-if="!row.entity.isIframeSupported">' + '\n' +
        '    <launch-site admin-email-param={{row.entity.adminEmailParam}}' + '\n' +
        '                 advanced-settings={{row.entity.advancedSettings}}' + '\n' +
        '                 user-email-param={{row.entity.userEmailParam}}' + '\n' +
        '                 webex-advanced-url={{row.entity.webexAdvancedUrl}}' + '\n' +
        '                 id = {{row.entity.license.siteUrl}}_xlaunch-webex-site-settings' + '\n' +
        '                 name={{row.entity.license.siteUrl}}_xlaunch-webex-site-settings>' + '\n' +
        '    </launch-site>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isIframeSupported">' + '\n' +
        '    <a id="{{row.entity.license.siteUrl}}_webex-site-settings"' + '\n' +
        '       name="{{row.entity.license.siteUrl}}_webex-site-settings"' + '\n' +
        '       ui-sref="site-list.site-settings({siteUrl:row.entity.license.siteUrl})">' + '\n' +
        '      <p class="ui-grid-cell-contents">' + '\n' +
        '        <i class="icon-settings icon"></i>' + '\n' +
        '      </p>' + '\n' +
        '    </a>' + '\n' +
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
        displayName: $translate.instant('siteList.type'),
        cellFilter: 'capacityFilter:row.entity.label',
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.volume',
        displayName: $translate.instant('siteList.licenseCount'),
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
        WebExApiGatewayService.csvGetStatus(siteUrl).then(
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
    } // updateCSVColumn()

  ]);
