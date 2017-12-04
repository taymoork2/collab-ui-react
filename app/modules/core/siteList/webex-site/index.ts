import './webex-site.scss';

import { WebexAddSiteModalComponent } from './webex-add-site-modal.component';
import { WebexSiteLicensesComponent } from './webex-site-licenses.component';
import { WebexSiteNewComponent } from './webex-site-new.component';
import { WebexSiteSubscriptionComponent } from './webex-site-subscription.component';
import { WebexSiteTransferComponent } from './webex-site-transfer.component';
import { WebexSiteNewDisplayComponent } from './webex-site-new-display.component';
import { WebexDeleteSiteModalComponent } from './webex-delete-site-modal.component';
import { WebexSiteResultDisplayComponent } from './webex-site-result-display.component';
import { WebExSiteService } from './webex-site.service';

export default angular
  .module('core.webex-site', [
    require('collab-ui-ng').default,
    require('modules/core/analytics'),
    require('angular-translate'),
    require('modules/core/notifications').default,
    require('modules/core/featureToggle').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    require('modules/core/setupWizard/setup-wizard.service').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/trials/trial.module'),
    require('modules/core/scripts/services/utils'),
  ])
  .component('webexAddSiteModal', new WebexAddSiteModalComponent())
  .component('webexSiteLicenses', new WebexSiteLicensesComponent())
  .component('webexSiteNew', new WebexSiteNewComponent ())
  .component('webexSiteTransfer', new WebexSiteTransferComponent())
  .component('webexSiteSubscription', new WebexSiteSubscriptionComponent ())
  .component('webexSiteNewDisplay', new WebexSiteNewDisplayComponent ())
  .component('webexDeleteSiteModal', new WebexDeleteSiteModalComponent ())
  .component('webexSiteResultDisplay', new WebexSiteResultDisplayComponent ())
  .service('WebExSiteService', WebExSiteService)
  .name;
