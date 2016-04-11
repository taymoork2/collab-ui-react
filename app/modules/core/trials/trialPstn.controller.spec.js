'use strict';

describe('Controller: TrialPstnCtrl', function () {
  var controller, trials, $httpBackend, $scope, $q, HuronConfig, TrialPstnService, TrialService, PstnSetupService;

  var customerName = 'Wayne Enterprises';
  var customerEmail = 'batman@darknight.com';

  beforeEach(module('core.trial'));
  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, _$q_, $controller, _$httpBackend_, _HuronConfig_, _TrialPstnService_, _TrialService_, _PstnSetupService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    TrialPstnService = _TrialPstnService_;
    TrialService = _TrialService_;
    PstnSetupService = _PstnSetupService_;
    $q = _$q_;

    spyOn(TrialService, 'getDeviceTrialsLimit');

    //Test initialize
    $scope.trial = TrialService.getData();
    $scope.trial.details.customerName = customerName;
    $scope.trial.details.customerEmail = customerEmail;

    controller = $controller('TrialPstnCtrl', {
      $scope: $scope,
      TrialPstnService: TrialPstnService,
    });

    trials = TrialPstnService.getData();

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should initialize with the company name and email', function () {
    expect(controller.trialData.details.pstnContractInfo.companyName).toEqual(customerName);
    expect(controller.trialData.details.pstnContractInfo.email).toEqual(customerEmail);
  });

  describe('Enter info to the controller and expect the same out of the service', function () {
    var carrier = {
      name: 'IntelePeer',
      uuid: '23453-235sdfaf-3245a-asdfa4'
    };
    var numberInfo = {
      state: {
        name: 'Texas',
        abbreviation: 'TX'
      },
      areaCode: {
        code: '469',
        count: 25
      },
      numbers: ["+14696500030", "+14696500102", "+14696500194", "+14696500208", "+14696500220"]
    };
    var contractInfo = {
      companyName: 'Sample Company',
      signeeFirstName: 'Samp',
      signeeLastName: 'Le',
      email: 'sample@snapple.com'
    };

    var carrierId = '25452345-agag-ava-43523452';

    var stateSearch = 'TX';

    var areaCodeResponse = {
      areaCodes: [{
        code: '469',
        count: 25
      }, {
        code: '817',
        count: 25
      }, {
        code: '123',
        count: 4
      }],
      count: 85
    };

    var newAreaCodes = [{
      code: '469',
      count: 25
    }, {
      code: '817',
      count: 25
    }];

    it('should set the carrier', function () {
      controller.trialData.details.pstnProvider = carrier;
      expect(trials.details.pstnProvider).toBe(carrier);
    });

    it('should set the legal contact information', function () {
      controller.trialData.details.pstnContractInfo = contractInfo;
      expect(trials.details.pstnContractInfo).toBe(contractInfo);
    });

    it('should set number data', function () {
      controller.trialData.details.pstnNumberInfo = numberInfo;
      expect(trials.details.pstnNumberInfo).toBe(numberInfo);
    });

    it('should get area codes', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/inventory/carriers/' + carrierId + '/did/count?state=' + stateSearch).respond(areaCodeResponse);
      controller.trialData.details.pstnProvider.uuid = carrierId;
      controller.trialData.details.pstnNumberInfo.state.abbreviation = stateSearch;
      controller.getStateInventory();

      $httpBackend.flush();

      expect(controller.areaCodeOptions).toEqual(newAreaCodes);
    });

  });
});
