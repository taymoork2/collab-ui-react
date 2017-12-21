import { PhoneButtonLayoutComponent } from './phoneButtonLayout.component';
import { PhoneButtonLayoutService } from './phoneButtonLayout.service';
import notifications from 'modules/core/notifications';
import featureMemberService from 'modules/huron/features/services';

export { PhoneButtonLayoutService, IPhoneButton } from './phoneButtonLayout.service';

export default angular
  .module('huron.phone-button-layout', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/accessibility').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    'dragularModule',
    'Core',
    notifications,
    featureMemberService,
  ])
  .component('ucPhoneButtonLayout', new PhoneButtonLayoutComponent())
  .service('PhoneButtonLayoutService', PhoneButtonLayoutService)
  .name;
