import { HybridCallServiceTestCallToolComponent } from './hybrid-call-service-test-call-tool.component';

require('./_hybrid-call-service-test-call-tool.scss');

export default angular
  .module('Hercules')
  .component('hybridCallServiceTestCallTool', new HybridCallServiceTestCallToolComponent())
  .name;
