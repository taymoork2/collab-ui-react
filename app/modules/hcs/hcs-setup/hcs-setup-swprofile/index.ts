import { HcsSetupSwprofileComponent } from './hcs-setup-swprofile.component';
import { HcsEditSwprofileDirectiveFactory } from './hcs-edit-swprofile.directive';
import { HcsAddSwprofileDirectiveFactory } from './hcs-add-swprofile.directive';

export default angular
  .module('hcs.setup-swprofile', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsSetupSwprofile', new HcsSetupSwprofileComponent())
  .directive('hcsAddSwprofile', HcsAddSwprofileDirectiveFactory)
  .directive('hcsEditSwprofile', HcsEditSwprofileDirectiveFactory)
  .name;
