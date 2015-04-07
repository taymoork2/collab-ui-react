'use strict';

angular.module('Core')
  .controller('SiteListCtrl', ['$translate', 'Authinfo', 'Config',
    function ($translate, Authinfo, Config) {
      var vm = this;

      vm.siteLaunch = {
        adminEmailParam: Authinfo.getPrimaryEmail(),
        advancedSettings: null,
        userEmailParam: null,
      };

      vm.gridData = Authinfo.getConferenceServices();

      vm.getWebexUrl = function (url) {
        return Config.getWebexAdvancedHomeUrl(url);
      };

      var rowTemplate =
        '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell" ng-click="showUserDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var siteUrlTemplate =
        '<launch-site admin-email-param="siteList.siteLaunch.adminEmailParam"' +
        'advanced-settings="siteList.siteLaunch.advancedSettings" user-email-param="siteList.siteLaunch.userEmailParam"' +
        'webex-advanced-url="siteList.getWebexUrl(row.entity.license.siteUrl)">' +
        '</launch-site>';

      vm.gridOptions = {
        data: 'siteList.gridData',
        multiSelect: false,
        showFilter: false,
        enableRowSelection: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: true,

        columnDefs: [{
          field: 'license.siteUrl',
          displayName: $translate.instant('siteList.siteName'),
          sortable: false
        }, {
          field: 'license.capacity',
          displayName: $translate.instant('siteList.type'),
          cellFilter: 'capacityFilter:row.entity.label',
          sortable: false
        }, {
          field: 'license.volume',
          displayName: $translate.instant('siteList.licenseCount'),
          sortable: false
        }, {
          field: 'license.siteUrl',
          displayName: $translate.instant('siteList.launchSite'),
          sortable: false,
          cellTemplate: siteUrlTemplate
        }]
      };
    }
  ]);
