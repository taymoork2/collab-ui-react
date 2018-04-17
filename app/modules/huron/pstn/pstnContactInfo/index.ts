import { PstnContactInfoComponent } from './pstnContactInfo.component';
import notificationModule from 'modules/core/notifications';
import terminusServiceModule from 'modules/huron/pstn/terminus.service';

export default angular
  .module('huron.pstn.pstn-contactInfo', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    notificationModule,
    terminusServiceModule,
  ])
  .component('ucPstnContactInfo', new PstnContactInfoComponent())
  .name;
