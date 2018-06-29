import featureToggleServiceModule from 'modules/core/featureToggle';
import { IntegrationsSettingComponent } from './integrations-setting.component';

export default angular.module('core.settings.integrations', [
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
  featureToggleServiceModule,
])
  .component('integrationsSetting', new IntegrationsSettingComponent())
  .name;
