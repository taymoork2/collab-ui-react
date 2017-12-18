'use strict';

var analyticsModule = require('./index');

describe('Service: Analytics', function () {
  var trialData = getJSONFixture('core/json/trials/trialData.json');
  var customerData = getJSONFixture('core/json/customers/customer.json');
  var getOrgData = {
    data: {
      isPartner: 'true',
    },
  };
  var listUsersData = {
    data: {
      totalResults: 5,
    },
  };

  function init() {
    this.initModules(analyticsModule);
    this.injectDependencies('$q', '$rootScope', '$state', 'Config', 'Analytics', 'Authinfo', 'Orgservice', 'TrialService', 'UserListService');
    initDependencySpies.apply(this);
    this.$scope = this.$rootScope.$new();
  }

  function initDependencySpies() {
    spyOn(this.Config, 'isProd');
    spyOn(this.TrialService, 'getDaysLeftForCurrentUser').and.returnValue(5);
    spyOn(this.UserListService, 'listUsers').and.returnValue(this.$q.resolve(listUsersData));
    spyOn(this.Analytics, '_init').and.returnValue(this.$q.resolve());
    spyOn(this.Analytics, '_track').and.callFake(_.noop);
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({
        success: true,
        isTestOrg: true,
      }, 200);
    });
    spyOn(this.Orgservice, 'getAdminOrgAsPromise').and.returnValue(this.$q.resolve(getOrgData));
  }

  function setIsProd(isProd) {
    return function () {
      this.Config.isProd.and.returnValue(isProd);
    };
  }

  ///////////////////////////

  beforeEach(init);

  describe('when Production is false', function () {
    beforeEach(setIsProd(false));

    it('should call _track', function () {
      this.Analytics.trackEvent('myState', {});
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });

    it('should not call _track if it is also not a test org', function () {
      this.Analytics._init.and.returnValue(this.$q.reject());
      spyOn(this.Analytics, 'checkIfTestOrg').and.returnValue(false);
      expect(this.Analytics._track).not.toHaveBeenCalled();
    });
  });

  describe('when Production is true', function () {
    beforeEach(setIsProd(true));

    it('should call _track', function () {
      this.Analytics.trackEvent('myState', {});
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling premium events', function () {
    beforeEach(function () {
      this.BMMP_DISMISSAL = 'BMMP Banner dismissal';
      this.PREMIUM_FILTER = 'Customer Overview Filtering';
      this.NO_EVENT_NAME = 'eventName not passed';
      this.premiumEvent = {
        cisco_from: 'my-state',
        cisco_orgId: '999',
        cisco_userId: '123',
        cisco_userRole: ['dummyRoles'],
      };

      _.set(this.$state, '$current.name', this.premiumEvent.cisco_from);
      spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.premiumEvent.cisco_orgId);
      spyOn(this.Authinfo, 'getUserId').and.returnValue(this.premiumEvent.cisco_userId);
      spyOn(this.Authinfo, 'getRoles').and.returnValue(this.premiumEvent.cisco_userRole);

      this.triggerEvent = function (eventName, location) {
        this.Analytics.trackPremiumEvent(eventName, location);
        this.$scope.$apply();
      };
    });

    it('should call _track when trackPremiumEvent is called', function () {
      this.premiumEvent.cisco_location = 'reports banner';
      this.triggerEvent(this.Analytics.sections.PREMIUM.eventNames.BMMP_DISMISSAL, this.premiumEvent.cisco_location);
      expect(this.Analytics._track.calls.mostRecent().args).toEqual([this.BMMP_DISMISSAL, jasmine.objectContaining(this.premiumEvent)]);
    });

    it('should call _track when trackPremiumEvent is called with no location', function () {
      this.triggerEvent(this.Analytics.sections.PREMIUM.eventNames.PREMIUM_FILTER);
      expect(this.Analytics._track.calls.mostRecent().args).toEqual([this.PREMIUM_FILTER, jasmine.objectContaining(this.premiumEvent)]);
    });

    it('should fail if there is no eventName', function () {
      expect(this.Analytics.trackPremiumEvent()).toBe(this.NO_EVENT_NAME);
    });
  });

  describe('when calling report event', function () {
    beforeEach(function () {
      this.CUST_SPARK_REPORT = 'Reports: Customer Spark Qlik report';
      this.CUST_WEBEX_REPORT = 'Reports: Customer WebEx Qlik report';
      this.PARTNER_SPARK_REPORT = 'Reports: Partner Spark Qlik report';

      spyOn(this.Authinfo, 'getUserId').and.returnValue('111');
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('999');

      this.triggerEvent = function (eventName) {
        this.Analytics.trackReportsEvent(eventName);
        this.$scope.$apply();
      };
    });
    it('should call _track when Customer Spark reports trackReportsEvent is called', function () {
      this.triggerEvent(this.Analytics.sections.REPORTS.eventNames.CUST_SPARK_REPORT);
      expect(this.Analytics._track.calls.mostRecent().args).toContain(this.CUST_SPARK_REPORT);
    });
    it('should call _track when Customer WebEx reports trackReportsEvent is called', function () {
      this.triggerEvent(this.Analytics.sections.REPORTS.eventNames.CUST_WEBEX_REPORT);
      expect(this.Analytics._track.calls.mostRecent().args).toContain(this.CUST_WEBEX_REPORT);
    });
    it('should call _track when Partner Spark reports trackReportsEvent is called', function () {
      this.triggerEvent(this.Analytics.sections.REPORTS.eventNames.PARTNER_SPARK_REPORT);
      expect(this.Analytics._track.calls.mostRecent().args).toEqual([this.PARTNER_SPARK_REPORT, { cisco_userId: '111', cisco_orgId: '999', cisco_type: false }]);
    });
  });

  describe('when calling trial events', function () {
    it('should call _track when trackTrialSteps is called', function () {
      this.Analytics.trackTrialSteps(this.Analytics.eventNames.START, {});
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });
    it('should not cause an error if duration or license count data is missing', function () {
      var fakeTrialDataMissingDetails = {
        randomValue: 'something',
        details: {
          licenseDuration: 1,
          licenseCount: 1,
        },
      };
      delete fakeTrialDataMissingDetails.details;

      this.Analytics.trackTrialSteps(this.Analytics.eventNames.START, 'someState', '123', fakeTrialDataMissingDetails);
      this.$scope.$apply();
      expect(this.Analytics.trackTrialSteps).not.toThrow();
      expect(this.Analytics._track).toHaveBeenCalled();
      var props = this.Analytics._track.calls.mostRecent().args[1];
      expect(props.duration).toBeUndefined();
      expect(props.licenseCount).toBeUndefined();
    });
    it('should send correct trial data', function () {
      this.Analytics.trackTrialSteps(this.Analytics.eventNames.START, trialData.enabled);
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
      var props = this.Analytics._track.calls.mostRecent().args[1];
      expect(props.cisco_duration).toBeDefined();
      expect(props.cisco_servicesArray).toBeDefined();
    });
    it('should return selected phone and room systems devices', function () {
      var result = this.Analytics._buildTrialDevicesArray(trialData.enabled.trials);
      this.$scope.$apply();
      expect(result.length).toBe(2);
      expect(result).toContain({ model: 'CISCO_8865', qty: 3 });
    });
  });

  describe('when tracking Add Users steps', function () {
    it('should call _track when trackAddUsers is called', function () {
      this.Analytics.trackAddUsers(this.Analytics.eventNames.START, {});
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });

    it('should send org data', function () {
      this.Analytics.trackAddUsers(this.Analytics.eventNames.START);
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
      var props = this.Analytics._track.calls.mostRecent().args[1];
      expect(props.cisco_isPartner).toEqual('true');
    });
    it('should add additional properties if passed in', function () {
      this.Analytics.trackAddUsers(this.Analytics.eventNames.START, null, { someProp: 'test' });
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
      var props = this.Analytics._track.calls.mostRecent().args[1];
      expect(props.cisco_someProp).toEqual('test');
    });
  });

  describe(' _getOrgStatus', function () {
    it('should return \'expired\' when there are no licenses', function () {
      var result = this.Analytics._getOrgStatus(32, null);
      expect(result).toBe('expired');
    });

    it('should return trial when there are any services in trial', function () {
      var result = this.Analytics._getOrgStatus(32, customerData.licenseList);
      expect(result).toBe('trial');
    });
    it('should return active when has licenses and no trial', function () {
      var licenseList = _.map(customerData.licenseList,
        function (license) {
          license.isTrial = false;
          return license;
        });
      var result = this.Analytics._getOrgStatus(32, licenseList);
      expect(result).toBe('active');
    });
  });
  describe(' _getDomainFromEmail', function () {
    it('should return an empty string when domain undefined', function () {
      var result = this.Analytics._getDomainFromEmail();
      expect(result).toBe('');
    });

    it('should return domain from email', function () {
      var result = this.Analytics._getDomainFromEmail('someone@cisco.com');
      expect(result).toBe('cisco.com');
    });
  });

  describe('_getOrgData', function () {
    it('should populate persistentProperties when they are empty', function () {
      this.Analytics.sections.ADD_USERS.persistentProperties = null;
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('999');
      this.Analytics._getOrgData('ADD_USERS').then(function (result) {
        expect(result.orgId).toBe('999');
        expect(this.Analytics.sections.ADD_USERS.persistentProperties.userCountPrior).toEqual('5');
        expect(this.Analytics.sections.ADD_USERS.persistentProperties.orgId).toBe('999');
      });
    });

    it('should not modify persistentProperties if not empty and orgId same as Authinfo orgId ', function () {
      this.Analytics.sections.ADD_USERS.persistentProperties = {
        orgId: '999',
        userCountPrior: '4',
      };

      this.Analytics._getOrgData('ADD_USERS').then(function (result) {
        expect(result.userCountPrior).toEqual('4');
      });
    });
  });
  describe('when calling partner events', function () {
    it('should call _track when trackPartnerActions is called to remove', function () {
      this.Analytics.trackPartnerActions(this.Analytics.sections.PARTNER.eventNames.REMOVE, 'removePage', '123');
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackUserPatch is called to patch', function () {
      this.Analytics.trackPartnerActions(this.Analytics.sections.PARTNER.eventNames.PATCH, '123', '456');
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling first time wizard events', function () {
    it('should call _track when trackSelectedCheckbox is called', function () {
      this.Analytics.trackUserOnboarding(this.Analytics.sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX, 'somePage', '123', { licenseId: '345' });
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });

    it('should call _track when trackConvertUser is called', function () {
      this.Analytics.trackUserOnboarding(this.Analytics.sections.USER_ONBOARDING.eventNames.CONVERT_USER, 'somePage', '123', {});
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalled();
    });
  });

  describe('when calling track error', function () {
    beforeEach(function () {
      spyOn(this.Authinfo, 'getUserId').and.returnValue('111');
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('999');
      spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue('someone@someplace.edu');
      _.set(this.$state, '$current.name', 'my-state');
    });
    it('should send necessary properties in event', function () {
      var error = new Error('Something went wrong');
      this.Analytics.trackError(error, 'some cause');
      this.$scope.$apply();
      expect(this.Analytics._track).toHaveBeenCalledWith('Runtime Error', jasmine.objectContaining({
        cisco_message: 'Something went wrong',
        cisco_cause: 'some cause',
        cisco_domain: 'someplace.edu',
        cisco_state: 'my-state',
      }));
    });
  });
});
