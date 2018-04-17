import { PhoneNumberService } from './phoneNumber.service';
import { telephoneNumberFilter } from './phoneNumber.filter';

export * from './phoneNumber.service';

export default angular
  .module('huron.phone-number-service', [
    require('@collabui/collab-ui-ng').default,
  ])
  .service('PhoneNumberService', PhoneNumberService)
  .filter('telephoneNumber', telephoneNumberFilter)
  .name;
