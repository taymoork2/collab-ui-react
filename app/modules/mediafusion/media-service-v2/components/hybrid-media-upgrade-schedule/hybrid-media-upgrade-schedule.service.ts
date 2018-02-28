//import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class HybridMediaUpgradeScheduleService {

  private everyDayData = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
  ) { }

  public updateUpgradeScheduleAndUI(data, clusterId: string) {
    return this.HybridServicesClusterService.setUpgradeSchedule(clusterId, {
      scheduleTime: data.scheduleTime.value,
      scheduleTimeZone: data.scheduleTimeZone.value,
      scheduleDays: this.everyDayData,
    });
  }

}
