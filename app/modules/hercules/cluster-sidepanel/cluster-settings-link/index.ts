import { ClusterSettingsLinkComponent } from './cluster-settings-link.component';

require('./_cluster-settings-link.scss');

export default angular
  .module('Hercules')
  .component('clusterSettingsLink', new ClusterSettingsLinkComponent())
  .name;
