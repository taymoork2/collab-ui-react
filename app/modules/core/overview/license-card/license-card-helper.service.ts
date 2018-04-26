import { HealthStatus, StatusType } from './index';

export class LicenseCardHelperService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public mapStatus(oldStatus: StatusType, componentStatus: StatusType): HealthStatus {
    if (oldStatus === StatusType.DANGER) {
      return StatusType.DANGER;
    } else if (componentStatus === StatusType.PARTIAL_OUTAGE || componentStatus === StatusType.DEGRADED_PERFORMANCE || oldStatus === StatusType.WARNING) {
      return StatusType.WARNING;
    } else if (componentStatus === StatusType.OPERATIONAL) {
      return StatusType.SUCCESS;
    }
    return StatusType.DANGER;
  }

  public mapStatusAria(oldStatus: StatusType, componentStatus: StatusType): string {
    if (oldStatus === StatusType.DANGER) {
      return this.$translate.instant('homePage.statusRed');
    } else if (componentStatus === StatusType.PARTIAL_OUTAGE || componentStatus === StatusType.DEGRADED_PERFORMANCE || oldStatus === StatusType.WARNING) {
      return this.$translate.instant('homePage.statusYellow');
    } else if (componentStatus === StatusType.OPERATIONAL) {
      return this.$translate.instant('homePage.statusGreen');
    } else {
      return this.$translate.instant('homePage.statusRed');
    }
  }
}
