import { OnPremisesExchangePrerequisitesComponent } from './on-premises-exchange-prerequisites.component';
import HybridServicesPrerequisitesHelperServiceModuleName from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName from 'modules/core/notifications';
import '../_common-hybrid-prerequisites.scss';

export default angular
  .module('services-overview.on-premises-exchange-prerequisites', [
    HybridServicesPrerequisitesHelperServiceModuleName,
    NotificationModuleName,
  ])
  .component('onPremisesExchangePrerequisites', new OnPremisesExchangePrerequisitesComponent())
  .name;
