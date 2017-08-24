import './services-overview.scss';

import { ServicesOverviewComponent } from 'modules/services-overview/services-overview.component';

export default angular
  .module('Hercules')
  .component('servicesOverview', new ServicesOverviewComponent())
  .name;
