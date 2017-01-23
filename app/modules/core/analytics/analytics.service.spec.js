'use strict';

describe('Service: Analytics', function () {
  var Config, Analytics, Authinfo, Orgservice, $q, $scope, $state, TrialService, UserListService;
  var trialData = getJSONFixture('core/json/trials/trialData.json');
  var customerData = getJSONFixture('core/json/customers/customer.json');
  var getOrgData = {
    data: {
      isPartner: 'true'
    }
  };
  var listUsersData = {
    data: {
      totalResults: 5
    }
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  afterEach(function () {
    Config = Analytics = Authinfo = Orgservice = $q = $scope = $state = TrialService = UserListService = undefined;
  });

  afterAll(function () {
    trialData = customerData = getOrgData = listUsersData = undefined;
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$q_, $rootScope, _$state_, _Config_, _Analytics_, _Authinfo_, _Orgservice_, _TrialService_, _UserListService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    Config = _Config_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    Orgservice = _Orgservice_;
    TrialService = _TrialService_;
    UserListService = _UserListService_;
  }

  function initSpies() {
    spyOn(Config, 'isProd');
    spyOn(TrialService, 'getDaysLeftForCurrentUser').and.returnValue(5);
    spyOn(UserListService, 'listUsers').and.returnValue($q.resolve(listUsersData));
    spyOn(Analytics, '_init').and.returnValue($q.resolve());
    spyOn(Analytics, '_track').and.callFake(_.noop);
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({
        success: true,
        isTestOrg: true
      }, 200);
    });
    spyOn(Orgservice, 'getAdminOrgAsPromise').and.returnValue($q.resolve(getOrgData));
  }

  function setIsProd(isProd) {
    return function () {
      Config.isProd.and.returnValue(isProd);
    };
  }

  describe('when Production is false', function () {
    beforeEach(setIsProd(false));

    it('should call _track', function () {
      Analytics.trackEvent('myState', {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should not call _track if it is also not a test org', function () {
      Analytics._init.and.returnValue($q.reject());
      spyOn(Analytics, 'checkIfTestOrg').and.returnValue(false);
      expect(Analytics._track).not.toHaveBeenCalled();
    });
  });

  describe('when Production is true', function () {
    beforeEach(setIsProd(true));

    it('should call _track', function () {
      Analytics.trackEvent('myState', {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling trial events', function () {
    it('should call _track when trackTrialSteps is called', function () {
      Analytics.trackTrialSteps(Analytics.eventNames.START, {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
    it('should not cause an error if duration or license count data is missing', function () {
      var fakeTrialDataMissingDetails = {
        randomValue: 'something',
        details: {
          licenseDuration: 1,
          licenseCount: 1
        }
      };
      delete fakeTrialDataMissingDetails.details;

      Analytics.trackTrialSteps(Analytics.eventNames.START, 'someState', '123', fakeTrialDataMissingDetails);
      $scope.$apply();
      expect(Analytics.trackTrialSteps).not.toThrow();
      expect(Analytics._track).toHaveBeenCalled();
      var props = Analytics._track.calls.mostRecent().args[1];
      expect(props.duration).toBeUndefined();
      expect(props.licenseCount).toBeUndefined();
    });
    it('should send correct trial data', function () {
      Analytics.trackTrialSteps(Analytics.eventNames.START, trialData.enabled);
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
      var props = Analytics._track.calls.mostRecent().args[1];
      expect(props.cisco_duration).toBeDefined();
      expect(props.cisco_servicesArray).toBeDefined();
    });
    it('should return selected phone and room systems devices', function () {
      var result = Analytics._buildTrialDevicesArray(trialData.enabled.trials);
      $scope.$apply();
      expect(result.length).toBe(2);
      expect(result).toContain({ model: 'CISCO_8865', qty: 3 });

    });
  });


  describe('when tracking Add Users steps', function () {

    it('should call _track when trackAddUsers is called', function () {
      Analytics.trackAddUsers(Analytics.eventNames.START, {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should send org data', function () {
      Analytics.trackAddUsers(Analytics.eventNames.START);
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
      var props = Analytics._track.calls.mostRecent().args[1];
      expect(props.cisco_isPartner).toEqual('true');

    });
    it('should add additional properties if passed in', function () {
      Analytics.trackAddUsers(Analytics.eventNames.START, null, { someProp: 'test' });
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
      var props = Analytics._track.calls.mostRecent().args[1];
      expect(props.cisco_someProp).toEqual('test');

    });
  });

  describe(' _getOrgStatus', function () {
    it('should return \'expired\' when there are no licenses', function () {
      var result = Analytics._getOrgStatus(32, null);
      expect(result).toBe('expired');
    });

    it('should return trial when there are any services in trial', function () {
      var result = Analytics._getOrgStatus(32, customerData.licenseList);
      expect(result).toBe('trial');
    });
    it('should return active when has licenses and no trial', function () {

      var licenseList = _.map(customerData.licenseList,
        function (license) {
          license.isTrial = false;
          return license;
        });
      var result = Analytics._getOrgStatus(32, licenseList);
      expect(result).toBe('active');
    });
  });
  describe(' _getDomainFromEmail', function () {
    it('should return an empty string when domain undefined', function () {
      var result = Analytics._getDomainFromEmail();
      expect(result).toBe('');
    });

    it('should return domain from email', function () {
      var result = Analytics._getDomainFromEmail('someone@cisco.com');
      expect(result).toBe('cisco.com');
    });
  });

  describe('_getOrgData', function () {
    it('should populate persistentProperties when they are empty', function () {
      Analytics.sections.ADD_USERS.persistentProperties = null;
      spyOn(Authinfo, 'getOrgId').and.returnValue('999');
      Analytics._getOrgData('ADD_USERS').then(function (result) {
        expect(result.orgId).toBe('999');
        expect(Analytics.sections.ADD_USERS.persistentProperties.userCountPrior).toEqual('5');
        expect(Analytics.sections.ADD_USERS.persistentProperties.orgId).toBe('999');
      });
    });

    it('should not modify persistentProperties if not empty and orgId same as Authinfo orgId ', function () {
      Analytics.sections.ADD_USERS.persistentProperties = {
        orgId: '999',
        userCountPrior: '4'
      };

      Analytics._getOrgData('ADD_USERS').then(function (result) {
        expect(result.userCountPrior).toEqual('4');
      });
    });
  });

  describe('when calling partner events', function () {
    it('should call _track when trackPartnerActions is called to remove', function () {
      Analytics.trackPartnerActions(Analytics.sections.PARTNER.eventNames.REMOVE, 'removePage', '123');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackUserPatch is called to patch', function () {
      Analytics.trackPartnerActions(Analytics.sections.PARTNER.eventNames.PATCH, '123', '456');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling first time wizard events', function () {
    it('should call _track when trackSelectedCheckbox is called', function () {
      Analytics.trackUserOnboarding(Analytics.sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX, 'somePage', '123', { licenseId: '345' });
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackConvertUser is called', function () {
      Analytics.trackUserOnboarding(Analytics.sections.USER_ONBOARDING.eventNames.CONVERT_USER, 'somePage', '123', {});
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling track error', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'getUserId').and.returnValue('111');
      spyOn(Authinfo, 'getOrgId').and.returnValue('999');
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue('someone@someplace.edu');
      _.set($state, '$current.name', 'my-state');
    });
    it('should send necessary properties in event', function () {
      var error = new Error('Something went wrong');
      Analytics.trackError(error, 'some cause');
      $scope.$apply();
      expect(Analytics._track).toHaveBeenCalledWith('Runtime Error', jasmine.objectContaining({
        cisco_message: 'Something went wrong',
        cisco_cause: 'some cause',
        cisco_domain: 'someplace.edu',
        cisco_state: 'my-state'
      }));
    });
  });
});
