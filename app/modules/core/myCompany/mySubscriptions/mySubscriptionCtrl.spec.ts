'use strict';

import { IProdInst } from 'modules/online/upgrade/upgrade.service';

describe('Controller: MySubscriptionCtrl', function () {
  const onlineIntSubId: string = 'intSubId';
  const trialUrl: string = 'https://atlas-integration.wbx2.com/admin/api/v1/commerce/online/' + onlineIntSubId;
  const trialUrlResponse: string = 'trialUrlResponse';
  const drUrlResponse: string = 'drUrlResponse';
  const ccwTrialSubId: string = 'Trial';
  const productInstanceId: string = 'productInstanceId';
  const productName: string = 'productName';
  const productInstanceResponse: IProdInst = {
    productInstanceId: productInstanceId,
    name: productName,
  };

  beforeEach(function () {
    this.data = _.cloneDeep(getJSONFixture('core/json/myCompany/subscriptionData.json'));
    this.data.licensesFormatted.forEach(function (item){
      item.subscriptions[0].siteUrl = undefined;
    });
    this.data.licensesFormatted[1].subscriptions[0].offers[0].siteUrl = undefined;
    this.data.trialLicenseData[0].subscriptions[0].siteUrl = undefined;

    this.data.subscriptionsFormatted[0].licenses[0].siteUrl = undefined;
    this.data.subscriptionsFormatted[0].licenses[1].siteUrl = undefined;
    this.data.subscriptionsFormatted[0].licenses[7].siteUrl = undefined;
    this.data.subscriptionsFormatted[0].licenses[8].siteUrl = undefined;
    this.data.subscriptionsFormatted[0].internalSubscriptionId = undefined;
    this.data.subscriptionsFormatted[0].upgradeTrialUrl = undefined;
    this.data.subscriptionsFormatted[0].productInstanceId = undefined;
    this.data.subscriptionsFormatted[0].changeplanOverride = undefined;
    this.data.subscriptionsFormatted[0].quantity = undefined;
    this.data.subscriptionsFormatted[0].name = undefined;
    this.data.trialSubscriptionData[0].licenses[0].siteUrl = undefined;
    this.data.trialSubscriptionData[0].upgradeTrialUrl = undefined;
    this.data.trialSubscriptionData[0].productInstanceId = undefined;
    this.data.trialSubscriptionData[0].changeplanOverride = undefined;
    this.data.trialSubscriptionData[0].internalSubscriptionId = undefined;
    this.data.trialSubscriptionData[0].quantity = undefined;
    this.data.trialSubscriptionData[0].name = undefined;

    this.initModules('Core', 'Hercules', 'Sunlight');
    this.injectDependencies('$controller', '$httpBackend', '$modal', '$rootScope', '$scope', '$q', 'Authinfo', 'DigitalRiverService', 'FeatureToggleService', 'OnlineUpgradeService', 'Orgservice', 'ServiceDescriptor');

    spyOn(this.ServiceDescriptor, 'getServices').and.returnValue(this.$q.when(this.data.servicesResponse));
    spyOn(this.FeatureToggleService, 'atlasSharedMeetingsGetStatus').and.returnValue(this.$q.when(false));
    spyOn(this.FeatureToggleService, 'atlasSharedMeetingsReportsGetStatus').and.returnValue(this.$q.when(false));
    spyOn(this.OnlineUpgradeService, 'getProductInstance').and.returnValue(this.$q.when(productInstanceResponse));
    spyOn(this.Authinfo, 'getUserId').and.returnValue('12345');
    spyOn(this.DigitalRiverService, 'getSubscriptionsUrl').and.returnValue(this.$q.when(drUrlResponse));
    spyOn(this.$rootScope, '$broadcast').and.callThrough();

    spyOn(this.$modal, 'open');

    this.startController = (): void => {
      this.controller = this.$controller('MySubscriptionCtrl', {
        $scope: this.$scope,
        $rootScope: this.$rootScope,
        Orgservice: this.Orgservice,
        ServiceDescriptor: this.ServiceDescriptor,
        Authinfo: this.Authinfo,
      });
      this.$scope.$apply();
    };
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should initialize with expected data for ccw orgs', function () {
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsResponse));
    this.startController();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.licensesFormatted);
    expect(this.controller.subscriptionDetails).toEqual(this.data.subscriptionsFormatted);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for online orgs', function () {
    this.data.subscriptionsResponse[0].internalSubscriptionId = onlineIntSubId;
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsResponse));
    this.data.subscriptionsFormatted[0].isOnline = true;
    this.data.subscriptionsFormatted[0].productInstanceId = productInstanceId;
    this.data.subscriptionsFormatted[0].name = productName;
    this.data.subscriptionsFormatted[0].changeplanOverride = drUrlResponse;
    this.data.subscriptionsFormatted[0].internalSubscriptionId = onlineIntSubId;
    this.data.subscriptionsFormatted[0].quantity = 100;
    this.startController();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.licensesFormatted);
    expect(this.controller.subscriptionDetails).toEqual(this.data.subscriptionsFormatted);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for ccw trial orgs', function () {
    this.data.subscriptionsTrialResponse[0].internalSubscriptionId = ccwTrialSubId;
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
    this.data.trialSubscriptionData[0].name = 'customerPage.trial';
    this.data.trialSubscriptionData[0].internalSubscriptionId = ccwTrialSubId;
    this.startController();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.trialLicenseData);
    expect(this.controller.subscriptionDetails).toEqual(this.data.trialSubscriptionData);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  it('should initialize with expected data for online trial orgs', function () {
    this.data.subscriptionsTrialResponse[0].internalSubscriptionId = onlineIntSubId;
    this.$httpBackend.whenGET(trialUrl).respond(this.$q.when(trialUrlResponse));
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
    this.data.trialSubscriptionData[0].isOnline = true;
    this.data.trialSubscriptionData[0].upgradeTrialUrl = trialUrlResponse;
    this.data.trialSubscriptionData[0].productInstanceId = productInstanceId;
    this.data.trialSubscriptionData[0].name = productName;
    this.data.trialSubscriptionData[0].internalSubscriptionId = onlineIntSubId;
    this.data.trialSubscriptionData[0].quantity = 100;

    this.startController();
    this.$httpBackend.flush();

    expect(this.controller.hybridServices).toEqual(this.data.servicesFormatted);
    expect(this.controller.licenseCategory).toEqual(this.data.trialLicenseData);
    expect(this.controller.subscriptionDetails).toEqual(this.data.trialSubscriptionData);
    expect(this.controller.visibleSubscriptions).toBeTruthy();
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });

  describe('Tests for Named User Licenses : ', function () {
    let dataWithNamedUserLicense = { offers: [{ licenseModel: 'hosts' }] };
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
      this.startController();
    });

    it('The isSharedMeetingsLicense() function should return false for a service that does not have shared Licenses ', function () {
      expect(this.controller.isSharedMeetingsLicense(dataWithNamedUserLicense)).toEqual(false);
    });

    it('The determineLicenseType() function should return licenseType Named User License string', function () {
      let result = this.controller.determineLicenseType(dataWithNamedUserLicense);
      expect(result).toEqual('firstTimeWizard.namedLicenses');
    });
  });

  describe('Tests for Shared Meeting Licenses : ', function () {
    let dataWithSharedMeetingsLicense = { offers: [{ licenseModel: 'Cloud Shared Meeting' }] };
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
      this.startController();
    });

    it('The isSharedMeetingsLicense() function should return true for a service that has shared licenses', function () {
      expect(this.controller.isSharedMeetingsLicense(dataWithSharedMeetingsLicense)).toEqual(true);
    });

    it('The determineLicenseType() function should return licenseType Shared Meeting License string', function () {
      let result = this.controller.determineLicenseType(dataWithSharedMeetingsLicense);
      expect(result).toEqual('firstTimeWizard.sharedLicenses');
    });
  });

  describe('Shared Meeting Report: ', function () {
    it('should open a modal when the shared meeting report is launched', function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.data.subscriptionsTrialResponse));
      this.startController();

      expect(this.$modal.open).toHaveBeenCalledTimes(0);
      this.controller.launchSharedMeetingsLicenseUsageReport('siteUrl');
      expect(this.$modal.open).toHaveBeenCalledTimes(1);
    });
  });
});
