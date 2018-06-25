'use strict';

var testModule = require('./index').default;

describe('Template: branding', function () {
  var $scope, $controller, controller, $q, $compile, view;
  var Notification, Orgservice, UserListService, BrandService, FeatureToggleService, Authinfo;

  var PARTNER_LOGO_RADIO = 'partnerLogoRadio';
  var CUSTOM_LOGO_RADIO = 'customLogoRadio';

  var ALLOW_LOGO_CHECKBOX = '#allowCustomerLogo';
  var PARTNER_NAME = 'Atlas_Test Partner';

  afterEach(function () {
    if (view) {
      view.remove();
    }
    $scope = $controller = controller = $q = $compile = view = undefined;
    Notification = Orgservice = UserListService = BrandService = FeatureToggleService = Authinfo = undefined;
  });

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _$compile_, _Notification_, _Orgservice_, _UserListService_, _BrandService_, _FeatureToggleService_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $compile = _$compile_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    UserListService = _UserListService_;
    BrandService = _BrandService_;
    FeatureToggleService = _FeatureToggleService_;
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
        orgSettings: {
          supportProviderCompanyName: PARTNER_NAME,
        },
      });
    });
    spyOn(BrandService, 'getLogoUrl').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
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

    it('should have partner org name', function () {
      expect(controller.supportProviderCompanyName).toEqual(PARTNER_NAME);
    });

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
