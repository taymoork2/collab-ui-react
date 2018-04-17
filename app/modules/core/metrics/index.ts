import {
  DiagnosticKey,
  OperationalKey,
  TimingKey,
} from './metrics.keys';

import {
  MetricsService,
} from './metrics.service';

export {
  DiagnosticKey,
  OperationalKey,
  TimingKey,
  MetricsService,
};

export default angular.module('core.metrics', [
  require('modules/core/auth/auth'),
  require('modules/core/auth/token.service'),
  require('modules/core/config/config').default,
])
  .service('MetricsService', MetricsService)
  .name;
