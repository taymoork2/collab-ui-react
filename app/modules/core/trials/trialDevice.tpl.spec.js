'use strict';

describe('Template: trialDevice.tpl.spec.js:', function () {

  var $compile, $controller, $httpBackend, $scope, $templateCache, $translate;
  var controller, view;
  var skipBtn, backBtn;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('core.trial'));
  // TODO - check for removal of Huron and Sunlight when DX80 and MX300 are officially supported
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);

  // TODO - remove $httpBackend when DX80 and MX300 are officially supported
  function dependencies(_$compile_, _$controller_, _$httpBackend_, _$rootScope_, _$templateCache_, _$translate_) {
    $compile = _$compile_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $scope = _$rootScope_.$new();
    $templateCache = _$templateCache_;
    $translate = _$translate_;
  }

  function compileView() {
    var template = $templateCache.get('modules/core/trials/trialDevice.tpl.html');

    controller = $controller('TrialDeviceController', {
      $scope: $scope
    });

    view = $compile(angular.element(template))($scope);

    // TODO - remove $httpBackend when DX80 and MX300 are officially supported
    $httpBackend
      .when('GET', 'https://identity.webex.com/identity/scim/null/v1/Users/me')
      .respond({});
    $scope.$apply();
  }

  describe('skip button:', function () {
    beforeEach(findSkipBtn);

    function findSkipBtn() {
      skipBtn = view.find('a.alt-btn-link');
    }

    it('should match the selector \'a.alt-btn-lnk\'', function () {
      expect(skipBtn.length).toBe(1);
    });

    it('should immediately precede the button with the selector \'button.btn[translate="common.back"]\'', function () {
      backBtn = view.find('button.btn[translate="common.back"]');
      var skipBtnDOMElem = skipBtn[0];
      var backBtnDOMElem = backBtn[0];
      expect(backBtnDOMElem.previousElementSibling).toBe(skipBtnDOMElem);
    });
  });

  // TODO: add tests for other template elements
  xdescribe('...other template elements...', function () {});
});
