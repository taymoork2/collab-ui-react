import { SubscriptionUpgradeButtonComponent } from './subscriptionUpgradeButton.component';
import bmmpModule from '../index';

export default angular
  .module('bmmp.subscriptionUpgradeButton', [
    bmmpModule,
  ])
  .component('bmmpSubscriptionUpgradeButton', new SubscriptionUpgradeButtonComponent())
  .name;