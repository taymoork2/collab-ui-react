import { PstnAddressService } from './pstn-address.service';
export * from './pstn-address.service';

import TerminusServiceModule from '../../terminus.service';

export default angular
  .module('huron.pstn.shared.pstn-address', [
    require('angular-resource'),
    TerminusServiceModule,
  ])
  .service('PstnAddressService', PstnAddressService)
  .name;
