import './_auto-answer.scss';
import { AutoAnswerComponent } from './autoAnswer.component';
import { AutoAnswerService } from './autoAnswer.service';

import lineService from 'modules/huron/lines/services';

export * from './autoAnswer.service';
export * from './autoAnswer';

export default angular
  .module('huron.auto-answer', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/device/device.module'),
    lineService,
  ])
  .component('ucAutoAnswer', new AutoAnswerComponent())
  .service('AutoAnswerService', AutoAnswerService)
  .name;
