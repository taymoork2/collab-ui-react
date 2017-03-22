import { PrivateTrunkDomainComponent } from './privateTrunkDomain.component';
import { PrivateTrunkDomainService } from './privateTrunkDomain.service';

export * from './privateTrunkDomain.service';

export default angular
  .module('hercules.private-trunk-domain', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('privateTrunkDomain', new PrivateTrunkDomainComponent())
  .service('PrivateTrunkDomainService', PrivateTrunkDomainService)
  .name;
