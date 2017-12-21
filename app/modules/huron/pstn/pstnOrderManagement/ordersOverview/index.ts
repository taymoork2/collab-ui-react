import { OrdersOverviewComponent } from './ordersOverview.component';
import phoneNumberModule from 'modules/huron/phoneNumber';
import FeatureToggleService from 'modules/core/featureToggle';
export default angular
  .module('huron.orders-overview', [
    require('@collabui/collab-ui-ng').default,
    'huron.order-detail',
    require('modules/huron/pstn/pstn.service').default,
    require('modules/huron/externalNumbers/externalNumber.service'),
    phoneNumberModule,
    FeatureToggleService,
  ])
  .component('ucOrdersOverview', new OrdersOverviewComponent())
  .name;
