import { HcsSetupModalService } from './hcs-setup-modal.service';
export * from './hcs-setup-modal.service';

export default angular
  .module('hcs.services.modalSetup', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .service('HcsSetupModalService', HcsSetupModalService)
  .name;
