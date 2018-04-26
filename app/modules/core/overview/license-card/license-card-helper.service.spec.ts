import testModule from './index';
import { StatusType } from './index';

describe('Service: LicenseCardHelperService', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('LicenseCardHelperService');
  });

  it('should return expected responses for mapStatus', function () {
    expect(this.LicenseCardHelperService.mapStatus(StatusType.DANGER, StatusType.DEGRADED_PERFORMANCE)).toEqual(StatusType.DANGER);
    expect(this.LicenseCardHelperService.mapStatus(undefined, StatusType.DEGRADED_PERFORMANCE)).toEqual(StatusType.WARNING);
    expect(this.LicenseCardHelperService.mapStatus(undefined, StatusType.OPERATIONAL)).toEqual(StatusType.SUCCESS);
    expect(this.LicenseCardHelperService.mapStatus(undefined, 'anything_else')).toEqual(StatusType.DANGER);
  });

  it('should return expected responses for mapStatusAria', function () {
    expect(this.LicenseCardHelperService.mapStatusAria(StatusType.DANGER, StatusType.DEGRADED_PERFORMANCE)).toEqual('homePage.statusRed');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, StatusType.DEGRADED_PERFORMANCE)).toEqual('homePage.statusYellow');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, StatusType.OPERATIONAL)).toEqual('homePage.statusGreen');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, 'anything_else')).toEqual('homePage.statusRed');
  });
});
