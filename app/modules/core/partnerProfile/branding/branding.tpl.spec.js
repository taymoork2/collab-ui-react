'use strict';

describe('Template: branding', function () {

  var $scope, $controller, controller, $q, $templateCache, $compile, view;
  var Notification, Orgservice, BrandService, FeatureToggleService, WebexClientVersion, Authinfo;

  var PARTNER_LOGO_RADIO = 'partnerLogoRadio';
  var CUSTOM_LOGO_RADIO = 'customLogoRadio';

  var ALLOW_LOGO_CHECKBOX = '#allowCustomerLogo';
  var USE_LATEST_WEBEX_CHECKBOX = '#useLatestWbxVersion';

  var USE_CISCO_EXAMPLE_LINK = 'useCiscoLogoExampleLink';
  var USE_CUSTOM_EXAMPLE_LINK = 'useCustomLogoExampleLink';
  var ALLOW_CUSTOM_EXAMPLE_LINK = "allowCustomLogExampleLink";

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _$templateCache_, _$compile_, _Notification_, _Orgservice_, _BrandService_, _FeatureToggleService_, _WebexClientVersion_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $templateCache = _$templateCache_;
    $compile = _$compile_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    BrandService = _BrandService_;
    FeatureToggleService = _FeatureToggleService_;
    WebexClientVersion = _WebexClientVersion_;
    Authinfo = _Authinfo_;
  }

  function initSpies() {

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({
        success: true,
        orgSettings: {}
      });
    });
    spyOn(BrandService, 'getLogoUrl').and.returnValue($q.when());
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(WebexClientVersion, 'getWbxClientVersions').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getTemplate').and.returnValue($q.when());
    spyOn(Authinfo, 'isPartner');
  }

  function compileView() {
    controller = $controller('BrandingCtrl', {
      $scope: $scope
    });
    var template = $templateCache.get('modules/core/partnerProfile/branding/branding.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  function setPartnerAndCompileView() {
    Authinfo.isPartner.and.returnValue(true);
    compileView();
  }

  describe('Regular Admin', function () {
    beforeEach(compileView);

    it('Partner logo radio should not exist', verifyRadioNotExist(PARTNER_LOGO_RADIO));
    it('Custom logo radio should not exist', verifyRadioNotExist(CUSTOM_LOGO_RADIO));

  });

  describe('Partner Admin', function () {
    beforeEach(setPartnerAndCompileView);

    it('Partner logo radio should have an appropriate label', verifyRadioAndLabel(PARTNER_LOGO_RADIO));
    it('Custom logo radio should have an appropriate label', verifyRadioAndLabel(CUSTOM_LOGO_RADIO));

    describe('Save buttons should not be visible with autosave changes', function () {
      it('by clicking allow logo checkbox', function () {
        spyOn($scope, 'toggleAllowCustomerLogos');
        view.find(ALLOW_LOGO_CHECKBOX).click();

        expect($scope.toggleAllowCustomerLogos).toHaveBeenCalled();
      });

      it('by clicking latest webex checkbox', function () {
        spyOn($scope, 'toggleWebexSelectLatestVersionAlways');
        view.find(USE_LATEST_WEBEX_CHECKBOX).click();

        expect($scope.toggleWebexSelectLatestVersionAlways).toHaveBeenCalled();
      });
    });
  });

  function verifyRadioAndLabel(id) {
    return function () {
      var radio = view.find('#' + id);
      var label = radio.next(); // Label should be next dom element for radio style rendering

      expect(radio.is('input')).toBeTruthy();
      expect(radio).toHaveAttr('type', 'radio');
      expect(label.is('label')).toBeTruthy();
      expect(label).toHaveAttr('for', id);
    };
  }

  function verifyRadioNotExist(id) {
    return function () {
      var radio = view.find('#' + id);

      expect(radio).not.toExist();
    };
  }

});
