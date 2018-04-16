import testModule from './index';
import { StatusTypes } from './index';

describe('Service: LicenseCardHelperService', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('LicenseCardHelperService');
  });

  it('should return expected responses for mapStatus', function () {
    expect(this.LicenseCardHelperService.mapStatus(StatusTypes.DANGER, StatusTypes.DEGRADED_PERFORMANCE)).toEqual(StatusTypes.DANGER);
    expect(this.LicenseCardHelperService.mapStatus(undefined, StatusTypes.DEGRADED_PERFORMANCE)).toEqual(StatusTypes.WARNING);
    expect(this.LicenseCardHelperService.mapStatus(undefined, StatusTypes.OPERATIONAL)).toEqual(StatusTypes.SUCCESS);
    expect(this.LicenseCardHelperService.mapStatus(undefined, 'anything_else')).toEqual(StatusTypes.DANGER);
  });

  it('should return expected responses for mapStatusAria', function () {
    expect(this.LicenseCardHelperService.mapStatusAria(StatusTypes.DANGER, StatusTypes.DEGRADED_PERFORMANCE)).toEqual('homePage.statusRed');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, StatusTypes.DEGRADED_PERFORMANCE)).toEqual('homePage.statusYellow');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, StatusTypes.OPERATIONAL)).toEqual('homePage.statusGreen');
    expect(this.LicenseCardHelperService.mapStatusAria(undefined, 'anything_else')).toEqual('homePage.statusRed');
  });
});
