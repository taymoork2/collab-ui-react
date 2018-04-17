import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';

interface ISchedule {
  dateTime: string;
  urgentScheduleTime: string;
  timeZone: string;
}

export class ScheduleInfoSectionComponentCtrl implements ng.IComponentController {

  private cluster: ICluster;
  public clusterType: string;

  public releaseChannelName: string;
  public resourceGroupName: string;
  public schedule: ISchedule | {} = {};

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private ResourceGroupService,
  ) {}

  public $onInit() {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {

    const { cluster } = changes;

    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.releaseChannelName = this.$translate.instant('hercules.fusion.add-resource-group.release-channel.' + this.cluster.releaseChannel);
      this.buildSchedule();
      this.findResourceGroupName()
        .then(resourceGroupName => {
          this.resourceGroupName = resourceGroupName;
        });
    }

  }

  private buildSchedule = () => {
    this.schedule = {
      dateTime: this.HybridServicesI18NService.formatTimeAndDate(this.cluster.upgradeSchedule),
      urgentScheduleTime: this.HybridServicesI18NService.formatTimeAndDate({
        scheduleTime: this.cluster.upgradeSchedule.urgentScheduleTime,
        // Simulate every day
        scheduleDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      }),
      timeZone: this.cluster.upgradeSchedule.scheduleTimeZone,
    };
  }

  private findResourceGroupName = () => {
    if (!this.cluster.resourceGroupId) {
      return this.$q.resolve(undefined);
    }
    return this.ResourceGroupService.get(this.cluster.resourceGroupId)
      .then(group => group.name);
  }

  public hasUrgentUpgradeSchedule = () => {
    return this.cluster && this.cluster.upgradeSchedule && this.cluster.upgradeSchedule.urgentScheduleTime;
  }

  public isHybridContextCluster() {
    return this.cluster && this.cluster.targetType === 'cs_mgmt';
  }

}

export class ScheduleInfoSectionComponent implements ng.IComponentOptions {
  public controller = ScheduleInfoSectionComponentCtrl;
  public template = require('modules/hercules/cluster-sidepanel/schedule-info/schedule-info.html');
  public bindings = {
    cluster: '<',
    clusterType: '<',
  };
}
