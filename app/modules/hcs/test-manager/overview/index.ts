import { TaasOverviewComponent } from './taasOverview.component';
import './_taas-overview.scss';

export default angular
  .module('hcs.taas.overview', [
    'ui.grid',
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/config/config').default,
  ])
  .component('taasOverview', new TaasOverviewComponent())
  .name;
