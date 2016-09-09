import { SubscriptionUpgradeButtonComponent } from './subscriptionUpgradeButton.component';
import bmmpModule from '../index';

require('./subscriptionUpgradeButton.scss');

export default angular
  .module('bmmp.subscriptionUpgradeButton', [
    bmmpModule,
  ])
  .component('bmmpSubscriptionUpgradeButton', new SubscriptionUpgradeButtonComponent())
  .name;