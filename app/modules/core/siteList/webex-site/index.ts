import './webex-site.scss';

import { WebexAddSiteModalComponent } from './webex-add-site-modal.component';
import { WebexSiteLicensesComponent } from './webex-site-licenses.component';
import { WebexSiteNewComponent } from './webex-site-new.component';
import { WebexSiteSubscriptionComponent } from './webex-site-subscription.component';

import { WebExSite } from 'modules/core/setupWizard/meeting-settings/meeting-settings.model';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config }  from 'modules/core/config/config';


export default angular
  .module('core.webex-site', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    SetupWizardService,
    WebExSite,
    Config,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/trials/trialTimeZone.service'),
    require('modules/core/trials/trialWebex.service'),
  ])
  .component('webexAddSiteModal', new WebexAddSiteModalComponent())
  .component('webexSiteLicenses', new WebexSiteLicensesComponent())
  .component('webexSiteNew', new WebexSiteNewComponent ())
  .component('webexSiteSubscription', new WebexSiteSubscriptionComponent ())
  .name;
