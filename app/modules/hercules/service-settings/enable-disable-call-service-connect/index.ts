import { HsEnableDisableCallServiceConnectComponent } from './hs-enable-disable-call-service-connect.component';

require('./_hs-enable-disable-call-service-connect.scss');

export default angular
  .module('Hercules')
  .component('hsEnableDisableCallServiceConnect', new HsEnableDisableCallServiceConnectComponent())
  .name;
