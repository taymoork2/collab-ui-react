'use strict';

describe(
  'WebExSiteSettingCtrl Test',
  function () {
    var $controller;
    var $scope;
    var $stateParams;
    var Authinfo;
    var $sce;
    var $translate;

    // source
    var paramsSiteUrl = "g0.webex.com";
    var paramsWebexPageId = "CommonSettings_address";
    var paramsSettingPageIframeUrl = '"https://g0.ciscospark.com/wbxadmin/address/addressbook.do?siteurl=sjsite14&actionFlag=first&currentPageNum=1&index=ALL"';
    var authPrimaryEmail = "mojoco@webex.com";
    var useLocale = "es_LA";

    // expected
    var scopeSiteSettingId = paramsWebexPageId;
    var scopeSiteSettingsBreadcrumbUiSref = "site-list.site-settings({siteUrl:" + "'" + paramsSiteUrl + "'" + "})";
    var scopeTrustIframeUrl = paramsSettingPageIframeUrl;
    var scopeAdminEmail = authPrimaryEmail;
    var scopeLocale = "es_MX";
    var scopeSiteName = paramsSiteUrl;

    beforeEach(angular.mock.module('WebExApp'));

    beforeEach(
      inject(
        function (_Authinfo_, _$controller_, _$translate_, _$sce_) {
          $scope = {};
          Authinfo = _Authinfo_;
          $controller = _$controller_;
          $translate = _$translate_;
          $sce = _$sce_;

          $stateParams = {
            'siteUrl': paramsSiteUrl,
            'webexPageId': paramsWebexPageId,
            'settingPageIframeUrl': paramsSettingPageIframeUrl,
          };

          spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(authPrimaryEmail);
          spyOn($translate, 'use').and.returnValue(useLocale);
          spyOn($sce, 'trustAsResourceUrl').and.returnValue(paramsSettingPageIframeUrl);

          var controller = $controller(
            'WebExSiteSettingCtrl', {
              $scope: $scope,
              $stateParams: $stateParams,
              $sce: $sce,
              Authinfo: Authinfo,
            }
          );
        }
      )
    );

    it(
      'should set the correct scope values',
      function () {
        expect($scope.siteSettingId).toEqual(scopeSiteSettingId);
        expect($scope.siteSettingsBreadcrumbUiSref).toEqual(scopeSiteSettingsBreadcrumbUiSref);
        expect($scope.trustIframeUrl).toEqual(scopeTrustIframeUrl);
        expect($scope.adminEmail).toEqual(scopeAdminEmail);
        expect($scope.locale).toEqual(scopeLocale);
        expect($scope.siteName).toEqual(scopeSiteName);
      }
    );
  }
);
