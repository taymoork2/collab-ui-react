import { AsyncIntervalService } from './async-interval.service';

export default angular
  .module('core.shared.async-interval', [])
  .service('AsyncIntervalService', AsyncIntervalService)
  .name;
