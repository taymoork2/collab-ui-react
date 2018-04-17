import { ConnectorUpgradeBannerComponent } from './connector-upgrade-banner.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('hercules.hybrid-services-nodes-page.connector-upgrade-banner', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('connectorUpgradeBanner', new ConnectorUpgradeBannerComponent())
  .name;
