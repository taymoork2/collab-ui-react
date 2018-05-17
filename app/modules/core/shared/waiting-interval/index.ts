import { WaitingIntervalService } from './waiting-interval.service';

export default angular
  .module('core.shared.waiting-interval', [])
  .service('WaitingIntervalService', WaitingIntervalService)
  .name;
