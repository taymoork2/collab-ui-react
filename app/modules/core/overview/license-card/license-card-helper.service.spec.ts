import testModule from './index';
import { HealthStatusType } from 'modules/core/health-monitor';

describe('Service: LicenseCardHelperService', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('LicenseCardHelperService');
  });

  it('should return expected responses for mapStatus', function () {
    expect(this.LicenseCardHelperService.mapStatus(HealthStatusType.DANGER, HealthStatusType.DEGRADED_PERFORMANCE)).toEqual(HealthStatusType.DANGER);
    expect(this.LicenseCardHelperService.mapStatus(undefined, HealthStatusType.DEGRADED_PERFORMANCE)).toEqual(HealthStatusType.WARNING);
    expect(this.LicenseCardHelperService.mapStatus(undefined, HealthStatusType.OPERATIONAL)).toEqual(HealthStatusType.SUCCESS);
    expect(this.LicenseCardHelperService.mapStatus(undefined, 'anything_else')).toEqual(HealthStatusType.DANGER);
  });

  it('should return expected responses for mapStatusAria', function () {
    expect(this.LicenseCardHelperService.mapStatusAria(HealthStatusType.DANGER, HealthStatusType.DEGRADED_PERFORMANCE)).toEqual('homePage.statusRed');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, HealthStatusType.DEGRADED_PERFORMANCE)).toEqual('homePage.statusYellow');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, HealthStatusType.OPERATIONAL)).toEqual('homePage.statusGreen');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, 'anything_else')).toEqual('homePage.statusRed');
  });
});
