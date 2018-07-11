import * as AnalyticsModuleName from 'modules/core/analytics';
import featureToggleModuleName from 'modules/core/featureToggle';
import NotificationModuleName from 'modules/core/notifications';
import CiscoCollaborationCloudCertificateServiceName from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store';
import ServiceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import { CallServiceSettingsPageComponent } from './call-service-settings-page.component';
import './_call-service-settings-page.scss';

export default angular
  .module('hercules.call-service-settings-page', [
    AnalyticsModuleName,
    CiscoCollaborationCloudCertificateServiceName,
    featureToggleModuleName,
    NotificationModuleName,
    ServiceDescriptorServiceModuleName,
  ])
  .component('callServiceSettingsPage', new CallServiceSettingsPageComponent())
  .name;
