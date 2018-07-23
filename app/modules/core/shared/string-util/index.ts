import { StringUtilService } from './string-util.service';

export default angular
  .module('core.shared.string-util', [])
  .service('StringUtilService', StringUtilService)
  .name;
