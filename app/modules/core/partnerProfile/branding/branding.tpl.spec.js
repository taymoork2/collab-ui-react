'use strict';

var testModule = require('./index').default;

describe('Template: branding', function () {
  var $scope, $controller, controller, $q, $compile, view;
  var Notification, Orgservice, UserListService, BrandService, FeatureToggleService, WebexClientVersion, Authinfo;

  var PARTNER_LOGO_RADIO = 'partnerLogoRadio';
  var CUSTOM_LOGO_RADIO = 'customLogoRadio';

  var ALLOW_LOGO_CHECKBOX = '#allowCustomerLogo';
  var USE_LATEST_WEBEX_CHECKBOX = '#useLatestWbxVersion';

  afterEach(function () {
    if (view) {
      view.remove();
    }
    $scope = $controller = controller = $q = $compile = view = undefined;
    Notification = Orgservice = UserListService = BrandService = FeatureToggleService = WebexClientVersion = Authinfo = undefined;
  });

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _$compile_, _Notification_, _Orgservice_, _UserListService_, _BrandService_, _FeatureToggleService_, _WebexClientVersion_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $compile = _$compile_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    UserListService = _UserListService_;
    BrandService = _BrandService_;
    FeatureToggleService = _FeatureToggleService_;
    WebexClientVersion = _WebexClientVersion_;
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
    spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.resolve());
    spyOn(UserListService, 'listPartners');
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({
        success: true,
        orgSettings: {},
      });
    });
    spyOn(BrandService, 'getLogoUrl').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(WebexClientVersion, 'getWbxClientVersions').and.returnValue($q.resolve(['version-1', 'version-2']));
    spyOn(WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue($q.resolve());
    spyOn(WebexClientVersion, 'getTemplate').and.returnValue($q.resolve());
    spyOn(WebexClientVersion, 'postOrPutTemplate').and.returnValue($q.resolve());
    spyOn(Authinfo, 'isPartner');
  }

  function compileView() {
    controller = $controller('BrandingCtrl as bctrl', {
      $scope: $scope,
    });
    var template = require('modules/core/partnerProfile/branding/branding.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  function setPartnerAndCompileView() {
    Authinfo.isPartner.and.returnValue(true);
    compileView();
  }

  describe('pre conditions', function () {
    beforeEach(compileView);
    it('Verify show branding is set', function () {
      expect(controller.showBranding).toBe(true);
    });
  });

  describe('client versions dropdown', function () {
    beforeEach(compileView);
    it('client versions drop down to exist', function () {
      var clientVersionsDropDown = view.find('#' + 'webex_client_version_drop_down');
      expect(clientVersionsDropDown).not.toBe(null);
    });
  });

  describe('Direct Customer Admin', function () {
    beforeEach(compileView);
    it('Partner logo radio should not exist', verifyRadioNotExist(PARTNER_LOGO_RADIO));
    it('Custom logo radio should not exist', verifyRadioNotExist(CUSTOM_LOGO_RADIO));
  });

  describe('Partner Admin', function () {
    beforeEach(setPartnerAndCompileView);

    it('Partner logo radio should have an appropriate label', verifyRadioAndLabel(PARTNER_LOGO_RADIO));
    it('Custom logo radio should have an appropriate label', verifyRadioAndLabel(CUSTOM_LOGO_RADIO));
    it('Allow logo checkbox should have an appropriate label', verifyCheckboxAndLabel(ALLOW_LOGO_CHECKBOX));
    it('Use latest version checkbox should have an appropriate label', verifyCheckboxAndLabel(USE_LATEST_WEBEX_CHECKBOX));

    describe('Save function should benn called', function () {
      it('by clicking allow logo checkbox', function () {
        spyOn(controller, 'toggleAllowCustomerLogos');
        view.find(ALLOW_LOGO_CHECKBOX).click();

        expect(controller.toggleAllowCustomerLogos).toHaveBeenCalled();
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

  function verifyCheckboxAndLabel(id) {
    return function () {
      var checkbox = view.find(id);
      var label = checkbox.next(); // Label should be next dom element for radio style rendering

      expect(checkbox.is('input')).toBeTruthy();
      expect(checkbox).toHaveAttr('type', 'checkbox');
      expect(label.is('label')).toBeTruthy();
      expect(label).toHaveAttr('for', id.substr(1));
    };
  }

  function verifyRadioNotExist(id) {
    return function () {
      var radio = view.find('#' + id);

      expect(radio).not.toExist();
    };
  }
});
