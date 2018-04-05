import { OfferNameService } from './offer-name.service';

export { OfferName } from './offer-name.keys';

export default angular.module('core.shared.offer-name', [
])
  .service('OfferNameService', OfferNameService)
  .name;
