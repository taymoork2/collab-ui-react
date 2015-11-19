'use strict';

angular.module('Core')
  .controller('SiteListCtrl', ['$translate', 'Authinfo', 'Config', '$log', 'Userservice', 'WebExUtilsFact',
    function ($translate, Authinfo, Config, $log, Userservice, WebExUtilsFact) {
      var vm = this;
      var funcName = "siteListCtrl()";
      var logMsg = "";

      vm.getWebexUrl = function (url) {
        return Config.getWebexAdvancedHomeUrl(url);
      };

      vm.siteLaunch = {
        adminEmailParam: Authinfo.getPrimaryEmail(),
        advancedSettings: null,
        userEmailParam: null,
      };

      vm.gridData = Authinfo.getConferenceServicesWithoutSiteUrl();

      vm.gridData.forEach(
        function initGrid(grid) {
          grid.showSiteLinks = false;
          grid.isIframeSupported = false;
          grid.isAdminReportEnabled = false;
          grid.webExSessionTicket = null;

          logMsg = funcName + ": " + "\n" +
            "grid=" + JSON.stringify(grid);
          // $log.log(logMsg);
        } // initGrid()
      ); // vm.gridData.forEach()

      // Start of grid set up
      var rowTemplate =
        '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell" ng-click="showUserDetails(row.entity)">' + '\n' +
        '  <div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' + '\n' +
        '  <div ng-cell></div>' + '\n' +
        '</div>' + '\n';

      var siteUrlTemplate =
        '<div ng-if="!row.entity.showSiteLinks">' + '\n' +
        '  <p class="ngCellText">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="row.entity.showSiteLinks">' + '\n' +
        '  <div ng-if="!row.entity.isIframeSupported">' + '\n' +
        '    <launch-site admin-email-param={{siteList.siteLaunch.adminEmailParam}}' + '\n' +
        '                 advanced-settings={{siteList.siteLaunch.advancedSettings}}' + '\n' +
        '                 user-email-param={{siteList.siteLaunch.userEmailParam}}' + '\n' +
        '                 webex-advanced-url={{siteList.getWebexUrl(row.entity.license.siteUrl)}}' + '\n' +
        '                 id = {{row.entity.license.siteUrl}}_xlaunch-webex-site-settings' + '\n ' +
        '                 name={{row.entity.license.siteUrl}}_xlaunch-webex-site-settings>' + '\n' +
        '    </launch-site>' + '\n' +
        '  </div>' + '\n' +
        '  <div ng-if="row.entity.isIframeSupported">' + '\n' +
        '    <a id="{{row.entity.license.siteUrl}}_webex-site-settings"' + '\n' +
        '       name="{{row.entity.license.siteUrl}}_webex-site-settings"' + '\n' +
        '       ui-sref="site-settings({siteUrl:row.entity.license.siteUrl})">' + '\n' +
        '      <p class="ngCellText">' + '\n' +
        '        <i class="icon-settings icon"></i>' + '\n' +
        '      </p>' + '\n' +
        '    </a>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      var siteReportsTemplate =
        '<div ng-if="!row.entity.showSiteLinks">' + '\n' +
        '  <p class="ngCellText">' + '\n' +
        '    <i class="icon-spinner icon"></i>' + '\n' +
        '  </p>' + '\n' +
        '</div>' + '\n' +
        '<div ng-if="row.entity.showSiteLinks">' + '\n' +
        '  <div ng-if="row.entity.isAdminReportEnabled">' + '\n' +
        '    <div ng-if="!row.entity.isIframeSupported">' + '\n' +
        '      <launch-site admin-email-param={{siteList.siteLaunch.adminEmailParam}}' + '\n' +
        '                   advanced-settings={{siteList.siteLaunch.advancedSettings}}' + '\n' +
        '                   user-email-param={{siteList.siteLaunch.userEmailParam}}' + '\n' +
        '                   webex-advanced-url={{siteList.getWebexUrl(row.entity.license.siteUrl)}}' + '\n' +
        '                   id={{row.entity.license.siteUrl}}_xlaunch-webex-site-reports' + '\n' +
        '                   name={{row.entity.license.siteUrl}}_xlaunch-webex-site-reports>' + '\n' +
        '      </launch-site>' + '\n' +
        '    </div>' + '\n' +
        '    <div ng-if="row.entity.isIframeSupported">' + '\n' +
        '       <a id="{{row.entity.license.siteUrl}}_webex-site-reports"' + '\n' +
        '          name="{{row.entity.license.siteUrl}}_webex-site-reports"' + '\n' +
        '          ui-sref="webex-reports({siteUrl:row.entity.license.siteUrl})"> ' + '\n' +
        '        <p class="ngCellText">' + '\n' +
        '          <i class="icon-settings icon"></i>' + '\n' +
        '        </p>' + '\n' +
        '       </a>' + '\n' +
        '    </div>' + '\n' +
        '  </div>' + '\n' +
        '</div>' + '\n';

      vm.gridOptions = {
        data: 'siteList.gridData',
        multiSelect: false,
        showFilter: false,
        enableRowSelection: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: true,
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
        field: 'license.siteUrl',
        displayName: $translate.instant('siteList.siteSettings'),
        cellTemplate: siteUrlTemplate,
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.siteReports',
        displayName: $translate.instant('siteList.siteReports'),
        cellTemplate: siteReportsTemplate,
        sortable: false
      });
      // End of grid set up

      if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
        getInfoFromXmlApi();
      } else {
        Userservice.getUser('me', function (data, status) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmail(data.emails);
              vm.siteLaunch.adminEmailParam = Authinfo.getPrimaryEmail();
              getInfoFromXmlApi();
            }
          }
        });
      }

      function getInfoFromXmlApi() {
        vm.gridData.forEach(
          function processGrid(grid) {
            var funcName = "processGrid()";
            var logMsg = "";

            var siteUrl = grid.license.siteUrl;

            WebExUtilsFact.isSiteSupportsIframe(siteUrl).then(
              function isSiteSupportsIframeSuccess(result) {
                var funcName = "isSiteSupportsIframeSuccess()";
                var logMsg = "";

                logMsg = funcName + ": " + "\n" +
                  "result=" + JSON.stringify(result);
                $log.log(logMsg);

                grid.isIframeSupported = result.isIframeSupported;
                grid.isAdminReportEnabled = result.isAdminReportEnabled;
                grid.showSiteLinks = true;

                logMsg = funcName + ": " + "\n" +
                  "siteUrl=" + siteUrl + "\n" +
                  "isIframeSupported=" + grid.isIframeSupported + "\n" +
                  "isAdminReportEnabled=" + grid.isAdminReportEnabled + "\n" +
                  "showSiteLinks=" + grid.showSiteLinks;
                $log.log(logMsg);
              }, // isSiteSupportsIframeSuccess()

              function isSiteSupportsIframeError(response) {
                var funcName = "isSiteSupportsIframeError()";
                var logMsg = "";

                grid.isIframeSupported = false;
                grid.isAdminReportEnabled = false;
                grid.showSiteLinks = true;

                logMsg = funcName + ": " + "\n" +
                  "response=" + JSON.stringify(response);
                $log.log(logMsg);
              } // isSiteSupportsIframeError()
            ); // WebExUtilsFact.isSiteSupportsIframe().then
          } // processGrid()
        ); // vm.gridData.forEach()
      } // getInfoFromXmlApi()

      // End of site links set up
    }
  ]);
