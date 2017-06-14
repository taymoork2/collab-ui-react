'use strict';

describe('Controller: TrialPstnCtrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'Hercules', 'core.trial');
    this.injectDependencies('$controller',
      '$httpBackend',
      '$q',
      '$rootScope',
      'Analytics',
      'FeatureToggleService',
      'HuronConfig',
      'Orgservice',
      'PstnService',
      'PstnAreaService',
      'TrialPstnService',
      'TrialService'
    );

    this.customerName = 'Wayne Enterprises';
    this.customerEmail = 'batman@darknight.com';

    this.carrier = {
      name: 'IntelePeer',
      uuid: '23453-235sdfaf-3245a-asdfa4',
    };

    this.location = {
      zipName: 'Zip Code',
      typeName: 'State',
      areas: [{
        name: 'Texas',
        abbreviation: 'TX',
      }],
    };

    this.numberInfo = {
      state: {
        name: 'Texas',
        abbreviation: 'TX',
      },
      areaCode: {
        code: '469',
        count: 25,
      },
      numbers: ["+14696500030", "+14696500102", "+14696500194", "+14696500208", "+14696500220"],
    };

    this.carrierId = '25452345-agag-ava-43523452';

    this.stateSearch = 'TX';

    this.areaCodeResponse = {
      areaCodes: [{
        code: '469',
        count: 25,
      }, {
        code: '817',
        count: 25,
      }, {
        code: '123',
        count: 4,
      }],
      count: 85,
    };

    this.newAreaCodes = [{
      code: '469',
      count: 25,
    }, {
      code: '817',
      count: 25,
    }];

    this.exchangesResponse = {
      exchanges: [
        { code: '731', count: 12 },
        { code: '742', count: 23 },
        { code: '421', count: 8 },
      ],
    };

    this.numbersResponse = {
      numbers: [
        "+17077318283", "+17077318284", "+17077318293", "+17077318294", "+17077318295",
        "+17077318296", "+17077318297", "+17077318298", "+17077318315", "+17077318316",
      ],
    };

    this.contractInfo = {
      companyName: 'Sample Company',
      signeeFirstName: 'Samp',
      signeeLastName: 'Le',
      email: 'sample@snapple.com',
    };

    spyOn(this.TrialService, 'getDeviceTrialsLimit');
    spyOn(this.PstnAreaService, 'getCountryAreas').and.returnValue(this.$q.resolve(this.location));

    spyOn(this.FeatureToggleService, 'huronSupportThinktelGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'huronFederatedSparkCallGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.Orgservice, 'getOrg');
    spyOn(this.Analytics, 'trackTrialSteps');

    //Test initialize
    this.$scope = this.$rootScope.$new();
    this.$scope.trial = this.TrialService.getData();
    this.$scope.trial.details.customerName = this.customerName;
    this.$scope.trial.details.customerEmail = this.customerEmail;

    spyOn(this.PstnService, 'getResellerV2').and.returnValue(this.$q.resolve());
    spyOn(this.PstnService, 'listResellerCarriers').and.returnValue(this.$q.resolve([]));
    spyOn(this.PstnService, 'listDefaultCarriers').and.returnValue(this.$q.resolve([]));
    spyOn(this.PstnService, 'searchCarrierInventory').and.returnValue(this.$q.resolve());


    this.initController = function () {
      this.controller = this.$controller('TrialPstnCtrl', {
        $scope: this.$scope,
        TrialPstnService: this.TrialPstnService,
      });
      this.trials = this.TrialPstnService.getData();
      this.$scope.$apply();
    };

    this.initController();

  });

  it('should be created successfully', function () {
    expect(this.controller).toBeDefined();
  });

  it('should initialize with the company name and email', function () {
    expect(this.controller.trialData.details.pstnContractInfo.companyName).toEqual(this.customerName);
    expect(this.controller.trialData.details.pstnContractInfo.emailAddress).toEqual(this.customerEmail);
  });

  it('should set the nxx params', function () {
    this.controller.searchCarrierInventory('817932');
    expect(this.controller.trialData.details.pstnNumberInfo.areaCode.code).toBe('817');
  });

  it('should reset NXX value when Area Code changes', function () {
    var areaCode = this.areaCodeResponse.areaCodes[0];

    this.controller.trialData.details.pstnProvider.uuid = this.carrierId;
    this.controller.trialData.details.pstnNumberInfo.state = this.location.areas[0];

    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + this.carrierId + '/numbers/count?numberType=DID&groupBy=nxx&npa=' + areaCode.code + '&state=' + this.stateSearch).respond(this.exchangesResponse);

    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + this.carrierId + '/numbers?numberType=DID&count=10&npa=' + areaCode.code + '&sequential=false' + this.stateSearch).respond(this.numbersResponse);

    this.controller.trialData.details.pstnNumberInfo.areaCode = areaCode;
    this.controller.trialData.details.pstnNumberInfo.nxx = this.exchangesResponse.exchanges[0];
    this.controller.onAreaCodeChange();
    expect(this.controller.trialData.details.pstnNumberInfo.nxx).toEqual(null);
  });

  describe('Enter info to the controller and expect the same out of the service', function () {

    it('should set the carrier', function () {
      this.controller.trialData.details.pstnProvider = this.carrier;
      expect(this.trials.details.pstnProvider).toBe(this.carrier);
    });

    it('should set the legal contact information', function () {
      this.controller.trialData.details.pstnContractInfo = this.contractInfo;
      expect(this.trials.details.pstnContractInfo).toBe(this.contractInfo);
    });

    it('should set number data', function () {
      this.controller.trialData.details.pstnNumberInfo = this.numberInfo;
      expect(this.trials.details.pstnNumberInfo).toBe(this.numberInfo);
    });

    it('should get area codes', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + this.carrierId + '/numbers/count?numberType=DID&state=' + this.stateSearch).respond(this.areaCodeResponse);
      this.controller.trialData.details.pstnProvider.uuid = this.carrierId;
      this.controller.trialData.details.pstnNumberInfo.state.abbreviation = this.stateSearch;
      this.controller.getStateInventory();

      this.$httpBackend.flush();

      expect(this.controller.pstn.areaCodeOptions).toEqual(this.newAreaCodes);
    });
  });

  describe('Adding phone numbers', function () {
    it('should not show number ordering', function () {

      var swivelCarrierDetails = [{
        "uuid": "4f5f5bf7-0034-4ade-8b1c-db63777f062c",
        "name": "INTELEPEER-SWIVEL",
        "apiImplementation": "SWIVEL",
        "countryCode": "+1",
        "country": "US",
        "defaultOffer": true,
        "vendor": "INTELEPEER",
        "url": "https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c",
      }];
      this.PstnService.listResellerCarriers.and.returnValue(this.$q.reject());
      this.PstnService.listDefaultCarriers.and.returnValue(this.$q.resolve(swivelCarrierDetails));
      this.controller.getCarriers();
      this.$scope.$apply();
      expect(this.controller.trialData.details.pstnProvider).toEqual(swivelCarrierDetails[0]);
      expect(this.controller.providerImplementation).toEqual(swivelCarrierDetails[0].apiImplementation);
    });

    it('should have the same result with toggles off on controller init', function () {

      var swivelCarrierDetails = [{
        "uuid": "4f5f5bf7-0034-4ade-8b1c-db63777f062c",
        "name": "INTELEPEER-SWIVEL",
        "apiImplementation": "SWIVEL",
        "countryCode": "+1",
        "country": "US",
        "defaultOffer": true,
        "vendor": "INTELEPEER",
        "url": "https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c",
      }];
      this.FeatureToggleService.huronSupportThinktelGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.huronFederatedSparkCallGetStatus.and.returnValue(this.$q.resolve(false));

      this.PstnService.listResellerCarriers.and.returnValue(this.$q.reject());
      this.PstnService.listDefaultCarriers.and.returnValue(this.$q.resolve(swivelCarrierDetails));

      this.initController();
      expect(this.controller.trialData.details.pstnProvider).toEqual(swivelCarrierDetails[0]);
      expect(this.controller.providerImplementation).toEqual(swivelCarrierDetails[0].apiImplementation);
    });

    it('should show number ordering', function () {

      var orderCarrierDetails = [{
        "uuid": "4f5f5bf7-0034-4ade-8b1c-db63777f062c",
        "name": "INTELEPEER",
        "apiImplementation": "INTELEPEER",
        "countryCode": "+1",
        "country": "US",
        "defaultOffer": true,
        "vendor": "INTELEPEER",
        "url": "https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c",
      }];
      this.PstnService.listResellerCarriers.and.returnValue(this.$q.reject());
      this.PstnService.listDefaultCarriers.and.returnValue(this.$q.resolve(orderCarrierDetails));
      this.controller.getCarriers();
      this.$scope.$apply();
      expect(this.controller.trialData.details.pstnProvider).toEqual(orderCarrierDetails[0]);
      expect(this.controller.providerImplementation).toEqual(orderCarrierDetails[0].apiImplementation);
    });

    it('should disable next button when required data missing for SWIVEL', function () {

      var swivelCarrierDetails = [{
        "uuid": "4f5f5bf7-0034-4ade-8b1c-db63777f062c",
        "name": "INTELEPEER-SWIVEL",
        "apiImplementation": "SWIVEL",
        "countryCode": "+1",
        "country": "US",
        "defaultOffer": true,
        "vendor": "INTELEPEER",
        "url": "https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c",
      }];
      this.PstnService.listResellerCarriers.and.returnValue(this.$q.reject());
      this.PstnService.listDefaultCarriers.and.returnValue(this.$q.resolve(swivelCarrierDetails));
      this.controller.getCarriers();
      this.$scope.$apply();
      expect(this.controller.trialData.details.pstnProvider).toEqual(swivelCarrierDetails[0]);
      expect(this.controller.invalidCount).toEqual(0);
      expect(this.controller.trialData.details.swivelNumbers).toHaveLength(0);
      expect(this.controller.trialData.details.pstnNumberInfo.numbers).toHaveLength(0);
      expect(this.controller.disableNextButton()).toBeTruthy();

      // add a number
      this.controller.manualTokenMethods.createdtoken({
        attrs: {
          value: '+19728131449',
        },
        relatedTarget: '<div></div>',
      });
      this.$scope.$apply();

      expect(this.controller.invalidCount).toEqual(0);
      expect(this.controller.trialData.details.swivelNumbers).toHaveLength(1);
      expect(this.controller.trialData.details.pstnNumberInfo.numbers).toHaveLength(0);
      expect(this.controller.disableNextButton()).toBeFalsy();

    });

    it('should disable next button when any invalid numbers', function () {

      var swivelCarrierDetails = [{
        "uuid": "4f5f5bf7-0034-4ade-8b1c-db63777f062c",
        "name": "INTELEPEER-SWIVEL",
        "apiImplementation": "SWIVEL",
        "countryCode": "+1",
        "country": "US",
        "defaultOffer": true,
        "vendor": "INTELEPEER",
        "url": "https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c",
      }];
      this.PstnService.listResellerCarriers.and.returnValue(this.$q.reject());
      this.PstnService.listDefaultCarriers.and.returnValue(this.$q.resolve(swivelCarrierDetails));
      this.controller.getCarriers();
      this.$scope.$apply();
      expect(this.controller.trialData.details.pstnProvider).toEqual(swivelCarrierDetails[0]);
      expect(this.controller.providerImplementation).toEqual(swivelCarrierDetails[0].apiImplementation);
      expect(this.controller.invalidCount).toEqual(0);
      expect(this.controller.trialData.details.swivelNumbers).toHaveLength(0);
      expect(this.controller.trialData.details.pstnNumberInfo.numbers).toHaveLength(0);
      expect(this.controller.disableNextButton()).toBeTruthy();

      // add a number
      this.controller.manualTokenMethods.createdtoken({
        attrs: {
          value: 'abc1234',
        },
        relatedTarget: '<div></div>',
      });
      this.$scope.$apply();

      expect(this.controller.invalidCount).toEqual(1);
      expect(this.controller.trialData.details.swivelNumbers).toHaveLength(1);
      expect(this.controller.trialData.details.pstnNumberInfo.numbers).toHaveLength(0);
      expect(this.controller.disableNextButton()).toBeTruthy();

    });

    it('should disable next button when required data missing for PSTN', function () {

      var orderCarrierDetails = [{
        "uuid": "4f5f5bf7-0034-4ade-8b1c-db63777f062c",
        "name": "INTELEPEER",
        "apiImplementation": "INTELEPEER",
        "countryCode": "+1",
        "country": "US",
        "defaultOffer": true,
        "vendor": "INTELEPEER",
        "url": "https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c",
      }];
      this.PstnService.listResellerCarriers.and.returnValue(this.$q.reject());
      this.PstnService.listDefaultCarriers.and.returnValue(this.$q.resolve(orderCarrierDetails));
      this.controller.getCarriers();
      this.$scope.$apply();
      expect(this.controller.trialData.details.pstnProvider).toEqual(orderCarrierDetails[0]);
      expect(this.controller.providerImplementation).toEqual('INTELEPEER');

      expect(this.controller.invalidCount).toEqual(0);
      expect(this.controller.trialData.details.swivelNumbers).toHaveLength(0);
      expect(this.controller.trialData.details.pstnNumberInfo.numbers).toHaveLength(0);
      expect(this.controller.disableNextButton()).toBeTruthy();

      // add contact info
      this.controller.trialData.details.pstnContractInfo = this.contractInfo;
      expect(this.controller.disableNextButton()).toBeTruthy();

      // add a number
      this.controller.trialData.details.pstnNumberInfo = this.numberInfo;
      this.$scope.$apply();

      expect(this.controller.invalidCount).toEqual(0);
      expect(this.controller.trialData.details.swivelNumbers).toHaveLength(0);
      expect(this.controller.trialData.details.pstnNumberInfo.numbers).toHaveLength(_.size(this.numberInfo.numbers));

      expect(this.controller.disableNextButton()).toBeFalsy();

    });
  });
});
