import moduleName from './index';
import { HybridServicesUserSidepanelSectionComponentCtrl } from './hybrid-services-user-sidepanel-section.component';

type Test = atlas.test.IComponentTest<HybridServicesUserSidepanelSectionComponentCtrl, {
  Authinfo,
  CloudConnectorService,
  FeatureToggleService,
  ServiceDescriptorService,
  UserOverviewService
  USSService,
  WaitingIntervalService,
}>;

describe('HybridServicesUserSidepanelSectionComponent', () => {
  beforeEach(function (this: Test) {
    this.initComponent = (user?) => {
      this.compileComponent('hybridServicesUserSidepanelSection', {
        user,
      });
    };
    this.initModules(moduleName);
    this.injectDependencies(
      'Authinfo',
      'CloudConnectorService',
      'FeatureToggleService',
      'ServiceDescriptorService',
      'UserOverviewService',
      'USSService',
      'WaitingIntervalService',
    );
  });

  describe('premises-based hybrid services', () => {
    beforeEach(function (this: Test) {
      spyOn(this.Authinfo, 'getLicenses').and.returnValue(['license1', 'license2']);
      spyOn(this.Authinfo, 'isEntitled').and.callFake(service => (service === 'squared-fusion-cal' || service === 'squared-fusion-uc' || service === 'spark-hybrid-impinterop'));
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('12');

      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve({}));
      spyOn(this.ServiceDescriptorService, 'getServices').and.returnValue(this.$q.resolve([{
        id: 'squared-fusion-uc',
        enabled: true,
      }, {
        id: 'squared-fusion-cal',
        enabled: false,
      }, {
        id: 'spark-hybrid-impinterop',
        enabled: true,
      }]));
      spyOn(this.USSService, 'getStatusesForUser').and.returnValue(this.$q.resolve({}));
      spyOn(this.UserOverviewService, 'getUser').and.returnValue(this.$q.resolve({
        user: {
          entitlements: ['ciscouc'],
        },
      }));
    });

    it('should not show the section if there are no licenses assigned to the user', function (this: Test) {
      const unlicensedUser = {
        licenseID: [],
      };
      this.initComponent(unlicensedUser);
      expect(this.controller.isLicensed).toBe(false);
    });

    it('should show the section if there is at least one paid license assigned to the user', function (this: Test) {
      const licensedUser = {
        licenseID: ['This is a paid license'],
      };
      this.initComponent(licensedUser);
      expect(this.controller.isLicensed).toBe(true);
    });

    it('should amend the services list with setup data from FMS', function (this: Test) {
      this.initComponent();
      expect(this.controller['enabledServicesWithStatuses'].length).toBe(2);
      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'squared-fusion-cal')).not.toBeDefined();
      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'squared-fusion-uc')).toEqual(jasmine.objectContaining({ id: 'squared-fusion-uc' }));
      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'spark-hybrid-impinterop')).toEqual(jasmine.objectContaining({ id: 'spark-hybrid-impinterop' }));

    });

    it('should tell the admin that hybrid call cannot be enabled if the user is entitled to Huron', function (this: Test) {
      this.initComponent();
      expect(this.controller.userIsEnabledForHuron).toBe(true);
    });
  });

  describe('cloud-based hybrid services', () => {
    beforeEach(function (this: Test) {
      spyOn(this.Authinfo, 'getLicenses').and.returnValue(['license1', 'license2']);
      spyOn(this.Authinfo, 'isEntitled').and.callFake((service) => {
        return (service === 'squared-fusion-gcal' || service === 'squared-fusion-cal');
      });
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('12');

      spyOn(this.CloudConnectorService, 'getService');
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve({}));
      spyOn(this.ServiceDescriptorService, 'getServices');
      spyOn(this.USSService, 'getStatusesForUser').and.returnValue(this.$q.resolve({}));
      spyOn(this.UserOverviewService, 'getUser').and.returnValue(this.$q.resolve());
    });

    it('should check status with CloudConnectorService if the org is entitled to Google Calendar', function (this: Test) {
      this.CloudConnectorService.getService.and.returnValues(this.$q.resolve({
        provisioned: true,
      }), this.$q.resolve({
        provisioned: true,
      }));
      this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
        id: 'squared-fusion-gcal',
        enabled: true,
      }, {
        id: 'squared-fusion-cal',
        enabled: true,
      }]));
      this.initComponent();
      expect(this.CloudConnectorService.getService.calls.count()).toBe(2);

    });

    it('should warn the admin if the user has conflicting calendar entitlements', function (this: Test) {
      this.UserOverviewService.getUser.and.returnValue(this.$q.resolve({
        user: {
          entitlements: ['squared-fusion-cal', 'squared-fusion-gcal'],
        },
      }));
      this.CloudConnectorService.getService.and.returnValues(this.$q.resolve({
        provisioned: true,
      }), this.$q.resolve({
        provisioned: false,
      }));
      this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
        id: 'squared-fusion-gcal',
        enabled: true,
      }, {
        id: 'squared-fusion-cal',
        enabled: true,
      }]));

      this.initComponent();
      expect(this.controller.bothCalendarTypesWarning).toBe(true);
    });

    it('should use values provided by the CCC to decide whether or not to show a calendar type', function (this: Test) {
      this.UserOverviewService.getUser.and.returnValue(this.$q.resolve({
        user: {
          entitlements: ['squared-fusion-cal'],
        },
      }));
      this.CloudConnectorService.getService.and.returnValues(this.$q.resolve({
        provisioned: true,
      }), this.$q.resolve({
        provisioned: false,
      }));
      this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
        id: 'squared-fusion-gcal',
        enabled: false,
      }, {
        id: 'squared-fusion-cal',
        enabled: false,
      }]));

      this.initComponent();
      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'squared-fusion-gcal')).not.toBeDefined();
      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'squared-fusion-cal')).toEqual(jasmine.objectContaining({ id: 'squared-fusion-cal' }));
    });

  });

  describe('USS and callback usage', () => {
    beforeEach(function (this: Test) {
      spyOn(this.Authinfo, 'getLicenses').and.returnValue(['license1', 'license2']);
      spyOn(this.Authinfo, 'isEntitled').and.callFake(service => (service === 'squared-fusion-uc' || service === 'spark-hybrid-impinterop'));
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('12');

      spyOn(this.USSService, 'getStatusesForUser');
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve({}));
      spyOn(this.ServiceDescriptorService, 'getServices').and.returnValue(this.$q.resolve([{
        id: 'squared-fusion-uc',
        enabled: true,
      }]));
      spyOn(this.WaitingIntervalService, 'interval').and.returnValue('fake-interval');
      spyOn(this.WaitingIntervalService, 'cancel');
    });

    it('should call USS with the correct userId', function (this: Test) {
      this.USSService.getStatusesForUser.and.returnValue(this.$q.resolve({}));
      const userId = '12345';
      const user = {
        id: userId,
        name: 'Marcus Aurelius',
      };
      this.initComponent(user);
      expect(this.USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    });

    it('should use USS data to populate services statuses for the user', function (this: Test) {
      this.USSService.getStatusesForUser.and.returnValue(this.$q.resolve([{
        serviceId: 'squared-fusion-uc',
        state: 'activated',
      }, {
        serviceId: 'spark-hybrid-impinterop',
        state: 'notActivated',
      }]));
      this.initComponent();

      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'squared-fusion-uc').status.state).toEqual('activated');
      expect(_.find(this.controller['enabledServicesWithStatuses'], (service: any) => service.id === 'spark-hybrid-impinterop')).not.toBeDefined();
    });

    it('should call USS once during init and subscribe to interval updates until $onDestroy', function (this: Test) {
      this.USSService.getStatusesForUser.and.returnValue(this.$q.resolve({}));
      this.initComponent({});

      expect(this.USSService.getStatusesForUser.calls.count()).toBe(1);
      expect(this.WaitingIntervalService.cancel).toHaveBeenCalledTimes(1); // $onChanges cancels before starting interval
      expect(this.WaitingIntervalService.interval).toHaveBeenCalledTimes(1);
      expect(this.controller['intervalPromise']).toBeDefined();

      this.controller.$onDestroy();
      expect(this.WaitingIntervalService.cancel).toHaveBeenCalledTimes(2);
      expect(this.controller['intervalPromise']).not.toBeDefined();
    });
  });
});
