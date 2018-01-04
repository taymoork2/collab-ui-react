import { SparkAssistantSettingComponent } from './spark-assistant-setting.component';
import { SparkAssistantService } from './spark-assistant-setting.service';
import notificationModule from 'modules/core/notifications';
import featureToggleModule from 'modules/core/featureToggle';

export * from './spark-assistant-setting.service';
export default angular.module('core.settings.sparkAssistant', [
  require('angular-cache'),
  require('angular-translate'),
  require('collab-ui-ng').default,
  require('modules/core/config/config').default,
  require('modules/hercules/services/service-descriptor.service').default,
  notificationModule,
  featureToggleModule,
])
  .component('sparkAssistantSetting', new SparkAssistantSettingComponent())
  .service('SparkAssistantService', SparkAssistantService)
  .name;
