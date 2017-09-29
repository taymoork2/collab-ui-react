import { CallServiceAwarePrerequisitesComponent } from './call-service-aware-prerequisites.component';

import '../_common-hybrid-prerequisites.scss';

export default angular
  .module('Hercules')
  .component('callServiceAwarePrerequisites', new CallServiceAwarePrerequisitesComponent())
  .name;
