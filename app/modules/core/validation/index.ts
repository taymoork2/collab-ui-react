import { ValidationService } from './validationService';

export * from './validationService';

export default angular
  .module('core.validationService', [])
  .service('ValidationService', ValidationService)
  .name;
