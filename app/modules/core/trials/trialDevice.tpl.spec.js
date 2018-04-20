'use strict';

describe('Template: trialDevice.tpl.spec.js:', function () {
  var $compile, $controller, $httpBackend, $scope, Analytics, Orgservice;
  var view;
  var skipBtn, backBtn;

  afterEach(function () {
    if (view) {
      view.remove();
    }
    $compile = $controller = $httpBackend = $scope = Analytics = Orgservice = undefined;
    view = skipBtn = backBtn = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('core.trial'));
  // TODO - check for removal of Huron and Sunlight when MX300 are officially supported
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(compileView);

  // TODO - remove $httpBackend when MX300 are officially supported
  function dependencies(_$compile_, _$controller_, _$httpBackend_, _$rootScope_, _Analytics_, _Orgservice_) {
    $compile = _$compile_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $scope = _$rootScope_.$new();
    Orgservice = _Orgservice_;
    Analytics = _Analytics_;
  }

  function initSpies() {
    // TODO - remove $httpBackend when MX300 are officially supported
    $httpBackend
      .when('GET', 'https://identity.webex.com/identity/scim/null/v1/Users/me')
      .respond({});
    spyOn(Orgservice, 'getOrg');
    spyOn(Analytics, 'trackTrialSteps');
  }

  function compileView() {
    var template = require('modules/core/trials/trialDevice.tpl.html');

    $controller('TrialDeviceController', {
      $scope: $scope,
    });

    view = $compile(angular.element(template))($scope);

    $scope.$apply();
  }

  describe('skip button:', function () {
    beforeEach(findSkipBtn);

    function findSkipBtn() {
      skipBtn = view.find('.skip-btn');
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
