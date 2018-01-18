import { OnPremisesCardComponent } from './on-premises-card.component';

export default angular
  .module('services-overview.active', [])
  .component('onPremisesCard', new OnPremisesCardComponent())
  .name;
