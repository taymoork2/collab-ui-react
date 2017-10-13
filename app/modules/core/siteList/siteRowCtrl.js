require('./_site-list.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExSiteRowCtrl', WebExSiteRowCtrl);

  /*@ngInject*/
  function WebExSiteRowCtrl($scope, $sce, $state, $timeout, FeatureToggleService, TokenService, WebExUtilsFact, WebExSiteRowService) {
    var vm = this;
    vm.showGridData = false;
    vm.isShowAddSite = false;

    FeatureToggleService.atlasWebexAddSiteGetStatus().then(function (result) {
      vm.isShowAddSite = result;
    });

    WebExSiteRowService.initSiteRows();
    vm.gridOptions = WebExSiteRowService.getGridOptions();

    vm.gridOptions.appScopeProvider = vm;

    vm.linkToReports = function (siteUrl) {
      $state.go('reports.webex-metrics', { siteUrl: siteUrl });
    };

    vm.linkToSiteAdminHomePage = function (siteUrl) {
      linkTOSiteAdminPage.call(vm, siteUrl, false);
    };

    vm.linkToSiteAdminLinkedPage = function (siteUrl) {
      linkTOSiteAdminPage.call(vm, siteUrl, true);
    };

    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    vm.showGridData = true;

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      WebExSiteRowService.stopPolling();
      WebExSiteRowService.initSiteRowsObj(); // this will allow re-entry to this page to use fresh content
    });

    function linkTOSiteAdminPage(siteUrl, toLinkedPage) {
      var adminUrl = [];
      adminUrl.push(WebExUtilsFact.getSiteAdminUrl(siteUrl));
      if (toLinkedPage) {
        adminUrl.push('&mainPage=');
        adminUrl.push(encodeURIComponent('accountlinking.do?siteUrl='));
        adminUrl.push(WebExUtilsFact.getSiteName(siteUrl));
      }
      vm.siteAdminUrl = adminUrl.join('');

      vm.accessToken = TokenService.getAccessToken();
      $timeout(function () {
        angular.element('#webExLinkedSiteFormBtn').click();
      }, 100);
    }
  } // WebExSiteRowCtrl()
})(); // top level function
