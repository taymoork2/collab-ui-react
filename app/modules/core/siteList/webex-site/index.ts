import './webex-site.scss';

import { WebexAddSiteModalComponent } from './webex-add-site-modal.component';
import { WebexSiteLicensesComponent } from './webex-site-licenses.component';
import { WebexSiteNewComponent } from './webex-site-new.component';
import { WebexSiteSubscriptionComponent } from './webex-site-subscription.component';
import { WebexSiteTransferComponent } from './webex-site-transfer.component';
import { WebexSiteNewDisplayComponent } from './webex-site-new-display.component';
import { WebexDeleteSiteModalComponent } from './webex-delete-site-modal.component';

export default angular
  .module('core.webex-site', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/notifications').default,
    require('modules/core/featureToggle').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    require('modules/core/setupWizard/setup-wizard.service').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/trials/trial.module'),
  ])
  .component('webexAddSiteModal', new WebexAddSiteModalComponent())
  .component('webexSiteLicenses', new WebexSiteLicensesComponent())
  .component('webexSiteNew', new WebexSiteNewComponent ())
  .component('webexSiteTransfer', new WebexSiteTransferComponent())
  .component('webexSiteSubscription', new WebexSiteSubscriptionComponent ())
  .component('webexSiteNewDisplay', new WebexSiteNewDisplayComponent ())
  .component('webexDeleteSiteModal', new WebexDeleteSiteModalComponent ())
  .name;
