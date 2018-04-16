import { HealthStatus, StatusTypes } from './index';

export class LicenseCardHelperService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public mapStatus(oldStatus, componentStatus): HealthStatus {
    if (oldStatus === StatusTypes.DANGER) {
      return StatusTypes.DANGER;
    } else if (componentStatus === StatusTypes.PARTIAL_OUTAGE || componentStatus === StatusTypes.DEGRADED_PERFORMANCE || oldStatus === StatusTypes.WARNING) {
      return StatusTypes.WARNING;
    } else if (componentStatus === StatusTypes.OPERATIONAL) {
      return StatusTypes.SUCCESS;
    }
    return StatusTypes.DANGER;
  }

  public mapStatusAria(oldStatus, componentStatus): string {
    if (oldStatus === StatusTypes.DANGER) {
      return this.$translate.instant('homePage.statusRed');
    } else if (componentStatus === StatusTypes.PARTIAL_OUTAGE || componentStatus === StatusTypes.DEGRADED_PERFORMANCE || oldStatus === StatusTypes.WARNING) {
      return this.$translate.instant('homePage.statusYellow');
    } else if (componentStatus === StatusTypes.OPERATIONAL) {
      return this.$translate.instant('homePage.statusGreen');
    } else {
      return this.$translate.instant('homePage.statusRed');
    }
  }
}
