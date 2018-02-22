import './add-resource-section.scss';

import { AddResourceSectionComponent } from './add-resource-section.component';
import NotificationModuleName from 'modules/core/notifications';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { AddResourceSectionService } from './add-resource-section.service';


export default angular.module('mediafusion.media-service-v2.components.add-resource-section', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  NotificationModuleName,
  HybridServicesExtrasService,
  HybridServicesClusterService,
  ProPackService,
  AddResourceSectionService,
])
  .component('addResourceSection', new AddResourceSectionComponent())
  .service('AddResourceSectionService', AddResourceSectionService)
  .name;
