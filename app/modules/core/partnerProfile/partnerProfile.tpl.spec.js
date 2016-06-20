'use strict';

describe('Template: partnerProfile', function () {
  var $scope, $controller, controller, $q, $templateCache, $compile, $log, view;
  var Notification, Orgservice, UserListService, BrandService, FeatureToggleService, WebexClientVersion, Authinfo;

  var BRAND_TPL = '#brandingTpl';

  var PROBLEM_SITE_RADIO_0 = 'problemSiteRadio0';
  var PROBLEM_SITE_RADIO_1 = 'problemSiteRadio1';
  var HELP_SITE_RADIO_0 = 'helpSiteRadio0';
  var HELP_SITE_RADIO_1 = 'helpSiteRadio1';

  var PARTNER_HELP_URL = '#partnerHelpUrl';

  var BUTTON_CONTAINER = '.save-section';
  var CANCEL_BUTTON = '#orgProfileCancelBtn';
  var SAVE_BUTTON = '#orgProfileSaveBtn';
  var INVISIBLE = 'invisible';

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _$templateCache_, _$compile_, _$log_, _Notification_, _Orgservice_, _UserListService_, _FeatureToggleService_, _Authinfo_, _BrandService_, _WebexClientVersion_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $log = _$log_;
    $templateCache = _$templateCache_;
    $compile = _$compile_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    BrandService = _BrandService_;
    WebexClientVersion = _WebexClientVersion_;
    UserListService = _UserListService_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
    spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.when());
    spyOn(UserListService, 'listPartners');
    spyOn(BrandService, 'getLogoUrl').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getWbxClientVersions').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getTemplate').and.returnValue($q.when());
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({
        success: true,
        orgSettings: {}
      });
    });
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(Authinfo, 'isPartner');
  }

  function compileView() {
    controller = $controller('PartnerProfileCtrl', {
      $scope: $scope
    });
    var template = $templateCache.get('modules/core/partnerProfile/partnerProfile.tpl.html');
    var elem = angular.element(template);
    elem.find('#brandingTpl').remove();
    view = $compile(elem)($scope);
    $scope.$apply();
  }

  describe('Regular Admin', function () {
    beforeEach(compileView);

    it('Problem site 0 radio should have an appropriate label', verifyRadioAndLabel(PROBLEM_SITE_RADIO_0));
    it('Problem site 1 radio should have an appropriate label', verifyRadioAndLabel(PROBLEM_SITE_RADIO_1));
    it('Help site 0 radio should have an appropriate label', verifyRadioAndLabel(HELP_SITE_RADIO_0));
    it('Help site 0 radio should have an appropriate label', verifyRadioAndLabel(HELP_SITE_RADIO_1));

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

  function expectExampleLinkExist(id) {
    return function () {
      var link = view.find('#' + id);
      expect(link).toExist();
    };
  }

});
