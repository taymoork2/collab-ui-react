import './placeOverview.scss';

import { PlaceOverviewComponent } from './placeOverview.component';
import * as HybridCallServicePlaceSettingsCtrl from 'modules/squared/places/overview/hybrid-call-service-place-settings/hybridCallServicePlaceSettingsCtrl.js';

import placeCallOverviewServiceModule from 'modules/squared/places/callOverview';
import preferredLanguageModule from 'modules/huron/preferredLanguage';
import locationsServiceModule from 'modules/call/locations/shared';
import USSServiceModuleName from 'modules/hercules/services/uss.service';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import DomainManagementServiceModuleName from 'modules/core/domainManagement';
import UCCServiceModuleName from 'modules/hercules/services/ucc-service';
import URIVerificationServiceModuleName from 'modules/hercules/services/uri-verification-service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';

export default angular
  .module('huron.place-overview', [
    require('angular-ui-router'),
    hybridServiceUserSidepanelHelperServiceModuleName,
    preferredLanguageModule,
    placeCallOverviewServiceModule,
    locationsServiceModule,
    USSServiceModuleName,
    HybridServicesClusterServiceModuleName,
    DomainManagementServiceModuleName,
    UCCServiceModuleName,
    URIVerificationServiceModuleName,
  ])
  .component('placeOverview', new PlaceOverviewComponent())
  .controller('HybridCallServicePlaceSettingsCtrl', HybridCallServicePlaceSettingsCtrl)
  .name;
