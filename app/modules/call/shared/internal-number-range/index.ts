import { InternalNumberRangeService } from 'modules/call/shared/internal-number-range/internal-number-range.service';

export { InternalNumberRangeService };
export * from './internal-number-range';

export default angular
  .module('call.shared.internal-number-range', [
    require('angular-resource'),
  ])
  .service('InternalNumberRangeService', InternalNumberRangeService)
  .name;
