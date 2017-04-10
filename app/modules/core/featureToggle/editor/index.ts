
import { FeatureToggleEditorComponent } from './featureTogglesEditor.component';
import { FeatureToggleEditorService } from './featureTogglesEditor.service';

import './featureTogglesEditor.scss';

import userModule from 'modules/core/auth/user';
import modalModule from 'modules/core/modal';
import notificationsModule from 'modules/core/notifications';
let urlConfigModule = require('modules/core/config/urlConfig');

export default angular
  .module('core.featuretoggle.editor', [
    urlConfigModule,
    userModule,
    modalModule,
    notificationsModule,
  ])
  .component('featureTogglesEditor', new FeatureToggleEditorComponent())
  .service('FeatureToggleEditorService', FeatureToggleEditorService)
  .name;
