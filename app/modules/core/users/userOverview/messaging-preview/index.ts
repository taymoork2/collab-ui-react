const MessagingPreviewCtrl = require('./messaging-preview.controller');

import './_messaging-preview.scss';

export default angular.module('core.users.userOverview.messaging-preview', [])
  .controller('MessagingPreviewCtrl', MessagingPreviewCtrl)
  .name;
