import { CallServiceSettingsPageComponent } from './call-service-settings-page.component';
import NotificationModuleName from 'modules/core/notifications';
import ServiceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import CiscoCollaborationCloudCertificateServiceName from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store';
import * as AnalyticsModuleName from 'modules/core/analytics';
import './_call-service-settings-page.scss';

export default angular
  .module('hercules.call-service-settings-page', [
    AnalyticsModuleName,
    ServiceDescriptorServiceModuleName,
    NotificationModuleName,
    CiscoCollaborationCloudCertificateServiceName,
  ])
  .component('callServiceSettingsPage', new CallServiceSettingsPageComponent())
  .name;
