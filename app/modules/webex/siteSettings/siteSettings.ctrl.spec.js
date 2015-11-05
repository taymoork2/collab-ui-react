'use strict';

describe('WebExSiteSettingsCtrl Test', function () {

  var $controller;
  var $scope;
  var $stateParams;
  var WebExSiteSettingsFact;
  var Authinfo;
  var $sce;
  var $translate;

  var siteUrl = 'go.webex.com';
  var resourceUrl = "https://g0.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminHomePage";
  var email = "mojoco@webex.com";
  var locale = "es_LA";
  var wxLocale = "es_MX";

  beforeEach(module('WebExSiteSettings'));
  beforeEach(module('WebExUtils'));
  beforeEach(module('WebExXmlApi'));

  beforeEach(inject(function (_Authinfo_, _$controller_, _$translate_, _$sce_) {
    $scope = {};
    Authinfo = _Authinfo_;
    $controller = _$controller_;
    $translate = _$translate_;
    $sce = _$sce_;

    $stateParams = {
      'siteUrl': siteUrl
    };

    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
    spyOn($translate, 'use').and.returnValue(locale);
    spyOn($sce, 'trustAsResourceUrl').and.returnValue(resourceUrl);

    var controller = $controller('WebExSiteSettingsCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $sce: $sce,
      Authinfo: Authinfo,
    });
  }));

  it('should set the correct scope values', function () {
    expect($scope.siteUrl).toEqual(siteUrl);
    expect($scope.webexAdvancedUrl).toEqual(resourceUrl);
    expect($scope.adminEmailParam).toEqual(email);
    expect($scope.locale).toEqual(wxLocale);
  });
});
