import { PstnProvidersComponent } from './pstnProviders.component';
import { PstnProvidersService } from './pstnProviders.service';
import pstnModel from '../pstn.model';
import pstnService from '../pstn.service';

export {
  IPstnCarrierGet,
  IPstnCarrierStatic,
  IPstnCarrierCapability,
  PstnCarrier,
} from './pstnCarrier';
export { PstnProvidersService } from './pstnProviders.service';

export default angular
  .module('huron.pstn.pstn-providers', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    pstnModel,
    pstnService,
  ])
  .service('PstnProvidersService', PstnProvidersService)
  .component('ucPstnProviders', new PstnProvidersComponent())
  .name;
