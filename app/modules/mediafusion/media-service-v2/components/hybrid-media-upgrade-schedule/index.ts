import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';
import { HybridMediaUpgradeScheduleComponent } from './hybrid-media-upgrade-schedule.component';
import { HybridMediaUpgradeScheduleService } from './hybrid-media-upgrade-schedule.service';
import './_hybrid-media-upgrade-schedule.scss';

export default angular
  .module('mediafusion/media-service-v2/components/hybrid-media-upgrade-schedule', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('hybridMediaUpgradeSchedule', new HybridMediaUpgradeScheduleComponent())
  .service('HybridMediaUpgradeScheduleService', HybridMediaUpgradeScheduleService)
  .name;
