import { DirectoryNumberComponent  } from './directoryNumber.component';
import { DirectoryNumberOptionsService } from './directoryNumberOptions.service';

export * from './directoryNumberOptions.service';

export default angular
  .module('huron.directory-number', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    'ngResource',
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucDirectoryNumber', new DirectoryNumberComponent())
  .service('DirectoryNumberOptionsService', DirectoryNumberOptionsService)
  .name;
