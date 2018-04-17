import { PartnerHomeComponent } from './partner-home.component';

import './partner-home.scss';
import './partner-landing-trials.scss';

// TODO: PartnerService needs to be moved to a separate module from Core and added here
export default angular
  .module('core.partner-home', [
    require('@collabui/collab-ui-ng').default,
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/cards').default,
    require('modules/core/featureToggle').default,
    require('modules/core/notifications').default,
    require('modules/core/scripts/services/org.service'),
    require('modules/core/trials/trial.module'),
  ])
  .component('partnerHome', new PartnerHomeComponent())
  .name;
