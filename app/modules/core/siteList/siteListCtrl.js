'use strict';

angular.module('Core')
  .controller('SiteListCtrl', ['$translate', 'Authinfo', 'Config', '$log', '$scope', 'Userservice',
    function ($translate, Authinfo, Config, $log, $scope, Userservice) {
      var vm = this;

      vm.siteLaunch = {
        adminEmailParam: Authinfo.getPrimaryEmail(),
        advancedSettings: null,
        userEmailParam: null,
      };

      if (_.isUndefined(Authinfo.getPrimaryEmail())) {
        Userservice.getUser('me', function (data, status) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmail(data.emails);
              vm.siteLaunch.adminEmailParam = Authinfo.getPrimaryEmail();
            }
          }
        });
      }

      vm.gridData = Authinfo.getConferenceServicesWithoutSiteUrl();

      vm.getWebexUrl = function (url) {
        return Config.getWebexAdvancedHomeUrl(url);
      };

      var rowTemplate =
        '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell" ng-click="showUserDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var siteUrlTemplate =
        '<launch-site admin-email-param="{{siteList.siteLaunch.adminEmailParam}}"' +
        '             advanced-settings="{{siteList.siteLaunch.advancedSettings}}"' +
        '             user-email-param="{{siteList.siteLaunch.userEmailParam}}"' +
        '             webex-advanced-url="{{siteList.getWebexUrl(row.entity.license.siteUrl)}}">' +
        '</launch-site>';

      var siteSettingsTemplate =
        '<div>' + '\n' +
        '  <a id="webex-site-settings"' + '\n' +
        '     ui-sref="site-settings({siteUrl:row.entity.license.siteUrl})">' + '\n' +
        '                             ' + '\n' +
        '    <p class="ngCellText">' + '\n' +
        '      <span name="webexSiteSettings"' + '\n' +
        '            id="webexSiteSettings">' + '\n' +
        '        <i class="fa fa-external-link fa-lg"></i>' + '\n' +
        '      </span>' + '\n' +
        '    </p>' + '\n' +
        '  </a>' + '\n' +
        '<div>' + '\n';

      var siteReportsTemplate =
        '<div>' + '\n' +
        '  <a id="webex-site-reportings"' + '\n' +
        '     ui-sref="site-reportings">' + '\n' +
        '                               ' + '\n' +
        '    <p class="ngCellText">' + '\n' +
        '      <span name="webexSiteReportings"' + '\n' +
        '            id="webexSiteReportings">' + '\n' +
        '        <i class="fa fa-external-link fa-lg"></i>' + '\n' +
        '      </span>' + '\n' +
        '    </p>' + '\n' +
        '  </a>' + '\n' +
        '<div>' + '\n';

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

      var iframeWebex = true;

      if (!iframeWebex) {
        vm.gridOptions.columnDefs.push({
          field: 'license.siteUrl',
          displayName: $translate.instant('siteList.siteSettings'),
          cellTemplate: siteUrlTemplate,
          sortable: false
        });

        vm.gridOptions.columnDefs.push({
          field: 'license.siteSettings',
          displayName: $translate.instant('siteList.siteReports'),
          sortable: false
        });
      } else {
        vm.gridOptions.columnDefs.push({
          field: 'license.siteSettings',
          displayName: $translate.instant('siteList.siteSettings'),
          cellTemplate: siteSettingsTemplate,
          sortable: false
        });

        /*
        vm.gridOptions.columnDefs.push({
          field: 'license.siteSettings',
          displayName: $translate.instant('siteList.siteReports'),
          cellTemplate: siteReportsTemplate,
          sortable: false
        });
        */
        vm.gridOptions.columnDefs.push({
          field: 'license.siteSettings',
          displayName: $translate.instant('siteList.siteReports'),
          cellTemplate: siteUrlTemplate,
          sortable: false
        });
      }
    }
  ]);
