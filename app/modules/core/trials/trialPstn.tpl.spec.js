'use strict';

describe('Template: trialPstn.tpl.spec.js:', function () {

  var $compile, $controller, $scope, $templateCache;
  var view;
  var skipBtn, backBtn;

  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);

  function dependencies(_$compile_, _$controller_, _$rootScope_, _$templateCache_) {
    $compile = _$compile_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $templateCache = _$templateCache_;
  }

  function compileView() {
    var template = $templateCache.get('modules/core/trials/trialPstn.tpl.html');

    $controller('TrialPstnCtrl', {
      $scope: $scope
    });

    view = $compile(angular.element(template))($scope);
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
