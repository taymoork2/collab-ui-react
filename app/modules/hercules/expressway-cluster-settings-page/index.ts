import { ExpresswayClusterSettingsPageComponent } from './expressway-cluster-settings-page.component';

require('./_expressway-cluster-settings-page.scss');

export default angular
  .module('Hercules')
  .component('expresswayClusterSettingsPage', new ExpresswayClusterSettingsPageComponent())
  .name;
