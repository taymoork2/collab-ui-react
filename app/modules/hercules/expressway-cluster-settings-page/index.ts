import { ExpresswayClusterSettingsPageComponent } from './expressway-cluster-settings-page.component';
import clusterSipDestinationSectionModuleName from './cluster-sip-destination-section';
import featureToggleServiceModuleName from 'modules/core/featureToggle';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';
import resourceGroupServiceModuleName from 'modules/hercules/services/resource-group.service';

require('./expressway-cluster-settings-page.scss');

export default angular
  .module('hercules.expressway-cluster-settings-page', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    clusterSipDestinationSectionModuleName,
    featureToggleServiceModuleName,
    hybridServicesClusterServiceModuleName,
    notificationsModuleName,
    resourceGroupServiceModuleName,
  ])
  .component('expresswayClusterSettingsPage', new ExpresswayClusterSettingsPageComponent())
  .name;
