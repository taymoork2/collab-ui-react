'use strict';

describe('Service: PstnSetupStatesService', function () {
  var $httpBackend, FeatureToggleService, PstnSetupStatesService, AuthInfo, $q;

  var usStatesList = getJSONFixture('../../app/modules/huron/pstnSetup/states.json');
  var usCanStatesList = getJSONFixture('../../app/modules/huron/pstnSetup/states_plus_canada.json');

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function mockDependencies($provide) {
    AuthInfo = {
      getOrgId: sinon.stub().returns('orgId'),
    };

    FeatureToggleService = {
      features: {
        huronSupportThinktel: '',
      },
      supports: jasmine.createSpy(),
    };

    $provide.value('Authinfo', AuthInfo);
    $provide.value('FeatureToggleService', FeatureToggleService);
  }

  function dependencies(_$q_, _$httpBackend_, _PstnSetupStatesService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    PstnSetupStatesService = _PstnSetupStatesService_;

    $httpBackend.when('GET', 'modules/huron/pstnSetup/states_plus_canada.json').respond(usStatesList);
    $httpBackend.when('GET', 'modules/huron/pstnSetup/states.json').respond(usCanStatesList);
  }


  describe('getStateProvinces', function () {

    it('should fail to get the Canadian Province Yukon because the feature toggle was disabled', function () {
      FeatureToggleService.supports = jasmine.createSpy().and.returnValue($q.resolve(true));
      PstnSetupStatesService.getStateProvinces().then(function (states) {
        expect(states).toBeDefined();
        expect(states.length).toBe(59);
        var returnedState = _.find(states, { 'name': "Yukon" });
        expect(returnedState).not.toBeDefined();
      });
      $httpBackend.flush();
    });

    it('should succeed in returning the Canadian Province Yukon because the feature toggle is enabled', function () {
      FeatureToggleService.supports = jasmine.createSpy().and.returnValue($q.resolve(false));
      PstnSetupStatesService.getStateProvinces().then(function (states) {
        expect(states).toBeDefined();
        expect(states.length).toBe(72);
        var returnedState = _.find(states, { 'name': "Yukon" });
        expect(returnedState).toBeDefined();
      });
      $httpBackend.flush();
    });
  });

});

