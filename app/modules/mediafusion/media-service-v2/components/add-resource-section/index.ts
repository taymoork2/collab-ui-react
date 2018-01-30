import './add-resource-section.scss';

import { AddResourceSectionComponent } from './add-resource-section.component';

export default angular.module('mediafusion.media-service-v2.components.add-resource-section', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('addResourceSection', new AddResourceSectionComponent())
  .name;
