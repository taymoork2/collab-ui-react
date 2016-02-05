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
      var siteCSVColumn = "\n" +
        '<div ng-if="!row.entity.showCSVInfo">' + '\n' +
        '  <p class="ui-grid-cell-contents">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="row.entity.showCSVInfo">' + '\n' +
        '  <div ng-if="!row.entity.isCSVSupported">' + '\n' +
        '    <p class="ui-grid-cell-contents">' + '\n' +
        '      Not Available' + '\n' +
        '    </p>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isCSVSupported">' + '\n' +
        '    <p class="ui-grid-cell-contents">' + '\n' +
        '      TBD' + '\n' +
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

      if (adminUserSupportCSV) {
        vm.gridOptions.columnDefs.push({
          field: 'siteCSV',
          displayName: $translate.instant('siteList.siteCsv'),
          cellTemplate: siteCSVColumn,
          sortable: false
        });
      }

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
      // End of grid set up

      if (!adminUserSupportCSV) {
        insertCSVColumn();
      } else {
        updateGrid();
      }

      function insertCSVColumn() {
        FeatureToggleService.supports(FeatureToggleService.features.webexCSV).then(
          function getSupportsCSVSuccess(result) {
            var funcName = "getSupportsCSVSuccess()";
            var logMsg = "";

            adminUserSupportCSV = result;
            if (adminUserSupportCSV) {
              var columnObj = {
                field: 'siteCSV',
                displayName: $translate.instant('siteList.siteCsv'),
                cellTemplate: siteCSVColumn,
                sortable: false
              };

              vm.gridOptions.columnDefs.splice(
                3,
                0,
                columnObj
              );
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
      } // insertCSVColumn()

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
                siteRow.isCSVSupported = (
                  result.isCSVSupported &&
                  adminUserSupportCSV
                ) ? true : false;

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
        if (siteRow.isCSVSupported) {
          siteRow.showCSVInfo = true;
          return;
        }

        // TODO
        siteRow.showCSVInfo = true;
      } // updateCSVColumn()
    }
  ]);
