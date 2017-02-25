'use strict';

describe('Template: trialPstn.tpl.spec.js:', function () {
  var $q, $compile, $controller, $scope, $templateCache, Analytics, Orgservice, PstnSetupStatesService, FeatureToggleService, PstnSetupService;
  var view;
  var skipBtn, backBtn;

  var states = [{
    name: 'Texas',
    abbreviation: 'TX',
  }];

  afterEach(function () {
    if (view) {
      view.remove();
    }
    $q = $compile = $controller = $scope = $templateCache = Analytics = Orgservice = PstnSetupStatesService = FeatureToggleService = PstnSetupService = undefined;
    view = skipBtn = backBtn = undefined;
  });

  afterAll(function () {
    states = undefined;
  });

  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);


  function dependencies(_$q_, _$compile_, _$controller_, _$rootScope_, _$templateCache_, _Analytics_, _Orgservice_, _PstnSetupStatesService_, _FeatureToggleService_, _PstnSetupService_) {
    $q = _$q_;
    $compile = _$compile_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $templateCache = _$templateCache_;
    PstnSetupStatesService = _PstnSetupStatesService_;
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    Analytics = _Analytics_;
    PstnSetupService = _PstnSetupService_;

    spyOn(PstnSetupStatesService, 'getStates').and.returnValue($q.resolve(states));
    spyOn(PstnSetupStatesService, 'getProvinces').and.returnValue($q.resolve(states));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(Analytics, 'trackTrialSteps');
    spyOn(PstnSetupService, 'getResellerV2').and.returnValue($q.resolve());
  }

  function compileView() {
    spyOn(Orgservice, 'getOrg');
    var template = $templateCache.get('modules/core/trials/trialPstn.tpl.html');

    $controller('TrialPstnCtrl', {
      $scope: $scope,
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
