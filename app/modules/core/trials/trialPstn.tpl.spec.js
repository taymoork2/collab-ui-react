'use strict';

describe('Template: trialPstn.tpl.spec.js:', function () {
  var areas = getJSONFixture('../../app/modules/huron/pstn/pstnAreaService/states.json');
  var $q, $compile, $controller, $scope, Analytics, Orgservice, PstnAreaService, PstnProvidersService, PstnService;
  var view;
  var skipBtn, backBtn;

  var location = {
    zipName: 'Zip Code',
    typeName: 'State',
    areas: areas,
  };

  var providers = [{
    name: 'INTELEPEER',
    logoSrc: null,
    logoAlt: 'IntelePeer',
    countryCode: 'US',
    docSrc: 'docs/carriers/IntelePeerVoicePackage.pdf',
    features: [
      'intelepeerFeatures.feature1',
      'intelepeerFeatures.feature2',
      'intelepeerFeatures.feature3',
      'intelepeerFeatures.feature4',
    ],
  }, {
    name: 'TATA',
    logoSrc: null,
    logoAlt: 'Tata',
    countryCode: 'US',
    docSrc: 'docs/carriers/IntelePeerVoicePackage.pdf',
    features: [
      'tataFeatures.feature1',
      'tataFeatures.feature2',
      'tataFeatures.feature3',
      'tataFeatures.feature4',
    ],
  }];

  afterEach(function () {
    if (view) {
      view.remove();
    }
    $q = $compile = $controller = $scope = Analytics = Orgservice = PstnAreaService = PstnService = undefined;
    view = skipBtn = backBtn = undefined;
  });

  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);


  function dependencies(_$q_, _$compile_, _$controller_, _$rootScope_, _Analytics_, _Orgservice_, _PstnAreaService_, _PstnProvidersService_, _PstnService_) {
    $q = _$q_;
    $compile = _$compile_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    PstnAreaService = _PstnAreaService_;
    Orgservice = _Orgservice_;
    Analytics = _Analytics_;
    PstnProvidersService = _PstnProvidersService_;
    PstnService = _PstnService_;

    spyOn(PstnProvidersService, 'getCarriers').and.returnValue($q.resolve(providers));
    spyOn(PstnAreaService, 'getCountryAreas').and.returnValue($q.resolve(location));

    spyOn(Analytics, 'trackTrialSteps');
    spyOn(PstnService, 'getResellerV2').and.returnValue($q.resolve());
  }

  function compileView() {
    spyOn(Orgservice, 'getOrg');
    var template = require('modules/core/trials/trialPstn.tpl.html');

    $controller('TrialPstnCtrl', {
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
    it('should match the selector \'.skip-btn\'', function () {
      expect(skipBtn.length).toBe(1);
    });

    it('should immediately precede the button with the selector \'button.btn[translate="common.back"]\'', function () {
      backBtn = view.find('button.btn[translate="common.back"]');
      var skipBtnDOMElem = skipBtn[0];
      var backBtnDOMElem = backBtn[0];
      expect(backBtnDOMElem.previousElementSibling).toBe(skipBtnDOMElem);
    });
  });
});
