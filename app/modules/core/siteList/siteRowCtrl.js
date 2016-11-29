(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExSiteRowCtrl', WebExSiteRowCtrl);
    //TokenService, WebExUtilsFact,

  /*@ngInject*/
  function WebExSiteRowCtrl($scope, $timeout, $sce, TokenService, WebExUtilsFact, WebExSiteRowService) {

    this.showGridData = false;

    WebExSiteRowService.initSiteRows();
    this.gridOptions = WebExSiteRowService.getGridOptions();

    this.linkToSiteAdminHomePage = function (siteUrl) {
      linkTOSiteAdminPage.call(this, siteUrl, false);
    };
    this.linkToSiteAdminLinkedPage = function (siteUrl) {
      linkTOSiteAdminPage.call(this, siteUrl, true);
    };

    this.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    this.showGridData = true;

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
      this.siteAdminUrl = adminUrl.join('');

      this.accessToken = TokenService.getAccessToken();
      $timeout(function () {
        angular.element('#webExLinkedSiteFormBtn').click();
      }, 100);
    }
  } // WebExSiteRowCtrl()
})(); // top level function
