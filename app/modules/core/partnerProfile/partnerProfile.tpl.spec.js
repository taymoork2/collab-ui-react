'use strict';

describe('Template: partnerProfile', function () {
  var $scope, $controller, controller, $q, $templateCache, $compile, view;
  var Notification, Orgservice, UserListService, BrandService, FeatureToggleService, WebexClientVersion, Authinfo;

  var PARTNER_LOGO_RADIO = 'partnerLogoRadio';
  var CUSTOM_LOGO_RADIO = 'customLogoRadio';
  var PROBLEM_SITE_RADIO_0 = 'problemSiteRadio0';
  var PROBLEM_SITE_RADIO_1 = 'problemSiteRadio1';
  var HELP_SITE_RADIO_0 = 'helpSiteRadio0';
  var HELP_SITE_RADIO_1 = 'helpSiteRadio1';

  var PARTNER_HELP_URL = '#partnerHelpUrl';

  var ALLOW_LOGO_CHECKBOX = '#allowCustomerLogo';
  var USE_LATEST_WEBEX_CHECKBOX = '#useLatestWbxVersion';

  var BUTTON_CONTAINER = '.save-section';
  var CANCEL_BUTTON = '#orgProfileCancelBtn';
  var SAVE_BUTTON = '#orgProfileSaveBtn';
  var INVISIBLE = 'invisible';

  var USE_CISCO_EXAMPLE_LINK = 'useCiscoLogoExampleLink';
  var USE_CUSTOM_EXAMPLE_LINK = 'useCustomLogoExampleLink';
  var ALLOW_CUSTOM_EXAMPLE_LINK = "allowCustomLogExampleLink";

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _$log_, _$templateCache_, _$compile_, _Notification_, _Orgservice_, _UserListService_, _BrandService_, _FeatureToggleService_, _WebexClientVersion_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $templateCache = _$templateCache_;
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
    spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.when());
    spyOn(UserListService, 'listPartners');
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
    controller = $controller('PartnerProfileCtrl', {
      $scope: $scope
    });
    var template = $templateCache.get('modules/core/partnerProfile/partnerProfile.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  function setPartnerAndCompileView() {
    Authinfo.isPartner.and.returnValue(true);
    compileView();
  }

  describe('Regular Admin', function () {
    beforeEach(compileView);

    it('Problem site 0 radio should have an appropriate label', verifyRadioAndLabel(PROBLEM_SITE_RADIO_0));
    it('Problem site 1 radio should have an appropriate label', verifyRadioAndLabel(PROBLEM_SITE_RADIO_1));
    it('Help site 0 radio should have an appropriate label', verifyRadioAndLabel(HELP_SITE_RADIO_0));
    it('Help site 0 radio should have an appropriate label', verifyRadioAndLabel(HELP_SITE_RADIO_1));
    it('Partner logo radio should not exist', verifyRadioNotExist(PARTNER_LOGO_RADIO));
    it('Custom logo radio should not exist', verifyRadioNotExist(CUSTOM_LOGO_RADIO));

    describe('Form Buttons', function () {

      it('should not be visible without form changes', expectButtonContainerNotVisible);
      it('should be visible after form changes', changeValueAndExpectButtonContainerVisible);

      describe('should be dismissed', function () {
        beforeEach(changeValueAndExpectButtonContainerVisible);
        afterEach(expectButtonContainerNotVisible);

        it('when cancel button is clicked', function () {
          spyOn($scope, 'init').and.callThrough();
          view.find(CANCEL_BUTTON).click();

          expect($scope.init).toHaveBeenCalled();
        });

        it('when save button is clicked', function () {
          spyOn($scope, 'validation').and.callThrough();
          view.find(SAVE_BUTTON).click();

          expect($scope.validation).toHaveBeenCalled();
          expect(Notification.success).toHaveBeenCalled();
        });
      });

    });
  });

  describe('Partner Admin', function () {
    beforeEach(setPartnerAndCompileView);

    it('Partner logo radio should have an appropriate label', verifyRadioAndLabel(PARTNER_LOGO_RADIO));
    it('Custom logo radio should have an appropriate label', verifyRadioAndLabel(CUSTOM_LOGO_RADIO));

    describe('Example Link', function () {
      it('show be exist near use custom logo radio', expectExampleLinkExist(USE_CUSTOM_EXAMPLE_LINK));
      it('show be exist near allow Custom Logo checkbox', expectExampleLinkExist(ALLOW_CUSTOM_EXAMPLE_LINK));
    });

    describe('Save buttons should not be visible with autosave changes', function () {
      afterEach(expectButtonContainerNotVisible);

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

  function changeValueAndExpectButtonContainerVisible() {
    view.find(PARTNER_HELP_URL).val('newHelpUrl').change();
    expect(view.find(BUTTON_CONTAINER)).not.toHaveClass(INVISIBLE);
  }

  function expectButtonContainerNotVisible() {
    expect(view.find(BUTTON_CONTAINER)).toHaveClass(INVISIBLE);
  }

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

  function expectExampleLinkExist(id) {
    return function () {
      var link = view.find('#' + id);
      expect(link).toExist();
    };
  }

});
