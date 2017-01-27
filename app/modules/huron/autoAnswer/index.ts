import 'modules/huron/autoAnswer/_auto-answer.scss';
import { AutoAnswerComponent } from 'modules/huron/autoAnswer/autoAnswer.component';
import { AutoAnswerService } from 'modules/huron/autoAnswer/autoAnswer.service';

import lineService from 'modules/huron/lines/services';

export * from 'modules/huron/autoAnswer/autoAnswer.service';
export * from 'modules/huron/autoAnswer/autoAnswer';

export default angular
  .module('huron.auto-answer', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
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
