import './placeOverview.scss';

import { PlaceOverviewComponent } from './placeOverview.component';
import * as HybridCallServicePlaceSettingsCtrl from 'modules/squared/places/overview/hybrid-call-service-place-settings/hybridCallServicePlaceSettingsCtrl.js';
import * as HybridCalendarServicePlaceSettingsCtrl from 'modules/squared/places/overview/hybrid-calendar-service-place-settings/hybridCalendarServicePlaceSettingsCtrl.js';
import * as HybridCloudberrySectionComponent from 'modules/squared/places/overview/hybrid-cloudberry-section/hybridCloudberrySection.component.js';

import placeCallOverviewServiceModule from 'modules/squared/places/callOverview';
import preferredLanguageModule from 'modules/huron/preferredLanguage';
import locationsServiceModule from 'modules/call/locations/shared';
import USSServiceModuleName from 'modules/hercules/services/uss.service';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import DomainManagementServiceModuleName from 'modules/core/domainManagement';
import UCCServiceModuleName from 'modules/hercules/services/ucc-service';
import URIVerificationServiceModuleName from 'modules/hercules/services/uri-verification-service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import cloudConnectorServiceModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import clusterServiceModuleName from 'modules/hercules/services/cluster-service';

export default angular
  .module('huron.place-overview', [
    require('angular-ui-router'),
    cloudConnectorServiceModuleName,
    clusterServiceModuleName,
    hybridServiceUserSidepanelHelperServiceModuleName,
    preferredLanguageModule,
    placeCallOverviewServiceModule,
    locationsServiceModule,
    serviceDescriptorServiceModuleName,
    USSServiceModuleName,
    HybridServicesClusterServiceModuleName,
    DomainManagementServiceModuleName,
    UCCServiceModuleName,
    URIVerificationServiceModuleName,
  ])
  .component('placeOverview', new PlaceOverviewComponent())
  .component('hybridCloudberrySection', HybridCloudberrySectionComponent)
  .controller('HybridCalendarServicePlaceSettingsCtrl', HybridCalendarServicePlaceSettingsCtrl)
  .controller('HybridCallServicePlaceSettingsCtrl', HybridCallServicePlaceSettingsCtrl)
  .name;
