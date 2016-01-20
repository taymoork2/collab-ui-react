'use strict';

angular.module('Core')
  .controller('SiteListCtrl', ['$translate', 'Authinfo', 'Config', '$log', 'Userservice', 'WebExUtilsFact',
    function ($translate, Authinfo, Config, $log, Userservice, WebExUtilsFact) {
      var funcName = "siteListCtrl()";
      var logMsg = "";

      var vm = this;
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl();

      vm.gridData = [];

      conferenceServices.forEach(
        function checkConferenceService(conferenceService) {
          var newSiteUrl = conferenceService.license.siteUrl;
          var isNewSiteUrl = true;

          vm.gridData.forEach(
            function checkGrid(grid) {
              if (newSiteUrl == grid.license.siteUrl) {
                isNewSiteUrl = false;

                logMsg = funcName + ": " + "\n" +
                  "Duplicate webex site url detected and skipped." + "\n" +
                  "newSiteUrl=" + newSiteUrl;
                $log.log(logMsg);
              }
            }
          );

          if (isNewSiteUrl) {
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
        field: 'license.siteUrl',
        displayName: $translate.instant('siteList.siteSettings'),
        cellTemplate: siteConfigColumn,
        sortable: false
      });

      vm.gridOptions.columnDefs.push({
        field: 'license.siteReports',
        displayName: $translate.instant('siteList.siteReports'),
        cellTemplate: siteReportsColumn,
        sortable: false
      });
      // End of grid set up

      if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
        initConfigAndReportColumns();
      } else {
        Userservice.getUser('me', function (data, status) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmail(data.emails);
              initConfigAndReportColumns();
            }
          }
        });
      }

      function initConfigAndReportColumns() {
        vm.gridData.forEach(
          function processGrid(grid) {
            var funcName = "processGrid()";
            var logMsg = "";

            var siteUrl = grid.license.siteUrl;

            grid.adminEmailParam = Authinfo.getPrimaryEmail();
            grid.userEmailParam = Authinfo.getPrimaryEmail();
            grid.advancedSettings = Config.getWebexAdvancedEditUrl(siteUrl);
            grid.webexAdvancedUrl = Config.getWebexAdvancedHomeUrl(siteUrl);

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
      } // initConfigAndReportColumns()

      // End of site links set up
    }
  ]);
