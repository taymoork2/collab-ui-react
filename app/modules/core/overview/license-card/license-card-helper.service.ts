import { HealthStatus, HealthStatusType } from 'modules/core/health-monitor';

export class LicenseCardHelperService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public mapStatus(oldStatus: HealthStatusType, componentStatus: HealthStatusType): HealthStatus {
    if (oldStatus === HealthStatusType.DANGER) {
      return HealthStatusType.DANGER;
    } else if (componentStatus === HealthStatusType.PARTIAL_OUTAGE || componentStatus === HealthStatusType.DEGRADED_PERFORMANCE || oldStatus === HealthStatusType.WARNING) {
      return HealthStatusType.WARNING;
    } else if (componentStatus === HealthStatusType.OPERATIONAL) {
      return HealthStatusType.SUCCESS;
    }
    return HealthStatusType.DANGER;
  }

  public mapStatusAria(oldStatus: HealthStatusType, componentStatus: HealthStatusType): string {
    if (oldStatus === HealthStatusType.DANGER) {
      return this.$translate.instant('homePage.statusRed');
    } else if (componentStatus === HealthStatusType.PARTIAL_OUTAGE || componentStatus === HealthStatusType.DEGRADED_PERFORMANCE || oldStatus === HealthStatusType.WARNING) {
      return this.$translate.instant('homePage.statusYellow');
    } else if (componentStatus === HealthStatusType.OPERATIONAL) {
      return this.$translate.instant('homePage.statusGreen');
    } else {
      return this.$translate.instant('homePage.statusRed');
    }
  }
}
