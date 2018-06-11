import './services-overview.scss';

import { CardCapacityBarComponent } from 'modules/services-overview/new-hybrid/card-capacity-bar/card-capacity-bar.component';
import { EnableUsersModalComponent } from 'modules/services-overview/new-hybrid/enable-users-modal/enable-users-modal.component';
import { EPTActiveCardComponent } from 'modules/services-overview/new-hybrid/active/ept-active-card.component';
import { EPTInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/ept-inactive-card.component';
import { HybridCalendarExchangeActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-calendar-exchange-active-card.component';
import { HybridCalendarExchangeInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-calendar-exchange-inactive-card.component';
import { HybridCalendarGoogleActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-calendar-google-active-card.component';
import { HybridCalendarGoogleInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-calendar-google-inactive-card.component';
import { HybridCalendarO365ActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-calendar-o365-active-card.component';
import { HybridCalendarO365InactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-calendar-o365-inactive-card.component';
import { HybridCallActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-call-active-card.component';
import { HybridCallInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-call-inactive-card.component';
import { HybridContextActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-context-active-card.component';
import { HybridContextInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-context-inactive-card.component';
import { HybridDataSecurityActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-data-security-active-card.component';
import { HybridDataSecurityInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-data-security-inactive-card.component';
import { HybridIMPActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-imp-active-card.component';
import { HybridIMPInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-imp-inactive-card.component';
import { HybridMediaActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-media-active-card.component';
import { HybridMediaInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-media-inactive-card.component';
import { Office365FailModalComponent } from 'modules/services-overview/new-hybrid/office-365-fail-modal/office-365-fail-modal.component';
import { Office365SetupModalComponent } from 'modules/services-overview/new-hybrid/office-365-setup-modal/office-365-setup-modal.component';
import { Office365TestModalComponent } from 'modules/services-overview/new-hybrid/office-365-test-modal/office-365-test-modal.component';
import { ServicesOverviewComponent } from 'modules/services-overview/services-overview.component';
import { HybridTestingInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hybrid-testing-inactive-card.component';
import { HybridTestingActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hybrid-testing-active-card.component';
import { HcsActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hcs-active-card.component';
import { HcsInactiveCardComponent } from 'modules/services-overview/new-hybrid/inactive/hcs-inactive-card.component';
import { HcsUpgradeActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hcs-upgrade-active-card.component';
import { HcsLicenseActiveCardComponent } from 'modules/services-overview/new-hybrid/active/hcs-license-active-card.component';
import userOverviewServiceModule from 'modules/core/users/userOverview';

export default angular
  .module('services-overview', [
    require('angular-translate'),
    require('modules/core/analytics'),
    require('modules/core/auth/auth'),
    require('modules/core/config/config').default,
    require('modules/core/featureToggle').default,
    require('modules/core/notifications').default,
    require('modules/core/proPack').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/users/userAdd/shared').default,
    require('modules/hcs/task-manager/shared').default,
    require('modules/hds/services/hds.service'),
    require('modules/hercules/private-trunk/private-trunk-services').default,
    require('modules/hercules/services/calendar-cloud-connector.service').default,
    require('modules/hercules/services/enterprise-private-trunk-service').default,
    require('modules/hercules/services/hybrid-services-cluster.service').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/hercules/services/uss.service').default,
    require('modules/services-overview/new-hybrid/card-users-summary').default,
    require('modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq').default,
    userOverviewServiceModule,
  ])
  .component('cardCapacityBar', new CardCapacityBarComponent())
  .component('enableUsersModal', new EnableUsersModalComponent())
  .component('eptActiveCard', new EPTActiveCardComponent())
  .component('eptInactiveCard', new EPTInactiveCardComponent())
  .component('hybridCalendarExchangeActiveCard', new HybridCalendarExchangeActiveCardComponent())
  .component('hybridCalendarExchangeInactiveCard', new HybridCalendarExchangeInactiveCardComponent())
  .component('hybridCalendarGoogleActiveCard', new HybridCalendarGoogleActiveCardComponent())
  .component('hybridCalendarGoogleInactiveCard', new HybridCalendarGoogleInactiveCardComponent())
  .component('hybridCalendarO365ActiveCard', new HybridCalendarO365ActiveCardComponent())
  .component('hybridCalendarO365InactiveCard', new HybridCalendarO365InactiveCardComponent())
  .component('hybridCallActiveCard', new HybridCallActiveCardComponent())
  .component('hybridCallInactiveCard', new HybridCallInactiveCardComponent())
  .component('hybridContextActiveCard', new HybridContextActiveCardComponent())
  .component('hybridContextInactiveCard', new HybridContextInactiveCardComponent())
  .component('hybridDataSecurityActiveCard', new HybridDataSecurityActiveCardComponent())
  .component('hybridDataSecurityInactiveCard', new HybridDataSecurityInactiveCardComponent())
  .component('hybridImpActiveCard', new HybridIMPActiveCardComponent())
  .component('hybridImpInactiveCard', new HybridIMPInactiveCardComponent())
  .component('hybridMediaActiveCard', new HybridMediaActiveCardComponent())
  .component('hybridMediaInactiveCard', new HybridMediaInactiveCardComponent())
  .component('office365FailModal', new Office365FailModalComponent())
  .component('office365SetupModal', new Office365SetupModalComponent())
  .component('office365TestModal', new Office365TestModalComponent())
  .component('servicesOverview', new ServicesOverviewComponent())
  .component('hybridTestingInactiveCard', new HybridTestingInactiveCardComponent())
  .component('hybridTestingActiveCard', new HybridTestingActiveCardComponent())
  .component('hcsActiveCard', new HcsActiveCardComponent())
  .component('hcsInactiveCard', new HcsInactiveCardComponent())
  .component('hcsUpgradeActiveCard', new HcsUpgradeActiveCardComponent())
  .component('hcsLicenseActiveCard', new HcsLicenseActiveCardComponent())
  .name;
