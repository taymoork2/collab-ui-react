import './cluster-sip-destination-section.scss';

import * as authInfoModule from 'modules/core/scripts/services/authinfo';
import modalServiceModuleName from 'modules/core/modal';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';

import { ClusterSipDestinationSectionComponent } from './cluster-sip-destination-section.component';

export default angular.module('hercules.expressway-cluster-settings-page.cluster-sip-destination-section', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  authInfoModule,
  modalServiceModuleName,
  serviceDescriptorServiceModuleName,
  ussServiceModuleName,
])
  .component('clusterSipDestinationSection', new ClusterSipDestinationSectionComponent())
  .name;