import { HcsLicensesSubscriptionComponent } from 'modules/hcs/hcs-licenses/hcs-licenses-subscription/hcs-licenses-subscription.component';
import featureModule from 'modules/core/featureToggle';
import './_hcs-licenses-subscription.scss';

export default angular
  .module('Sunlight.numbers', [
    require('modules/core/scripts/services/authinfo'),
    featureModule,
  ])
  .component('hcsLicensesSubscription', new HcsLicensesSubscriptionComponent())
  .name;
