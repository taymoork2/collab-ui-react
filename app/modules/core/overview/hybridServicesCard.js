(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var hybridServicesCardTemplatePath = require('ngtemplate-loader?module=Core!./hybridServicesCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard($q, Authinfo, CloudConnectorService, Config, FeatureToggleService, HybridServicesClusterService, HybridServicesClusterStatesService, HybridServicesUtilsService, Notification, ServiceDescriptorService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.name = 'overview.cards.hybrid.title';
        card.cardClass = 'hybrid-card';
        card.template = hybridServicesCardTemplatePath;
        card.icon = 'icon-circle-data';
        card.enabled = false;
        card.notEnabledAction = 'https://www.cisco.com/go/hybrid-services';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.serviceList = [];

        function init() {
          $q.all({
            atlasOffice365Support: FeatureToggleService.atlasOffice365SupportGetStatus(),
            hybridImp: FeatureToggleService.atlasHybridImpGetStatus(),
          }).then(function (featureToggles) {
            card.notEnabledText = 'overview.cards.hybrid.notEnabledTextNew';

            return HybridServicesUtilsService.allSettled({
              clusterList: HybridServicesClusterService.getAll(),
              gcalService: Authinfo.isEntitled(Config.entitlements.fusion_gcal) ? CloudConnectorService.getService('squared-fusion-gcal') : $q.resolve({ setup: false }),
              o365Service: featureToggles.atlasOffice365Support ? CloudConnectorService.getService('squared-fusion-o365') : $q.resolve({ setup: false }),
              serviceStatuses: ServiceDescriptorService.getServices(),
              featureToggles: featureToggles,
            });
          }).then(function (response) {
            var serviceStatuses = [];
            var statusInFMS = {};
            if (response.gcalService.status === 'fulfilled') {
              if (Authinfo.isEntitled(Config.entitlements.fusion_gcal)) {
                card.serviceList.push(response.gcalService.value);
              }
            } else {
              Notification.errorWithTrackingId(response.gcalService.reason, 'overview.cards.hybrid.googleCalendarError');
            }
            if (response.o365Service.status === 'fulfilled') {
              var value = response.o365Service.value;
              value.serviceId = 'squared-fusion-o365';
              card.serviceList.push(value);
            } else {
              Notification.errorWithTrackingId(response.o365Service.reason, 'overview.cards.hybrid.o365CalendarError');
            }
            if (response.serviceStatuses.status === 'fulfilled') {
              serviceStatuses = response.serviceStatuses.value;
            } else {
              Notification.errorWithTrackingId(response.serviceStatuses.reason, 'overview.cards.hybrid.herculesError');
            }
            if (response.clusterList.status === 'fulfilled') {
              if (Authinfo.isEntitled(Config.entitlements.fusion_cal)) {
                statusInFMS = _.find(serviceStatuses, function (service) {
                  return service.id === 'squared-fusion-cal';
                });
                card.serviceList.push({
                  serviceId: 'squared-fusion-cal',
                  cssClass: HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', response.clusterList.value)),
                  setup: statusInFMS && statusInFMS.enabled,
                });
              }
              if (Authinfo.isEntitled(Config.entitlements.fusion_uc)) {
                statusInFMS = _.find(serviceStatuses, function (service) {
                  return service.id === 'squared-fusion-uc';
                });
                card.serviceList.push({
                  serviceId: 'squared-fusion-uc',
                  cssClass: HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-uc', response.clusterList.value)),
                  setup: statusInFMS && statusInFMS.enabled,
                });
              }
              if (Authinfo.isEntitled(Config.entitlements.imp) && _.get(response, 'featureToggles.value.hybridImp')) {
                statusInFMS = _.find(serviceStatuses, function (service) {
                  return service.id === 'spark-hybrid-impinterop';
                });
                card.serviceList.push({
                  serviceId: 'spark-hybrid-impinterop',
                  cssClass: HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(HybridServicesClusterService.processClustersToAggregateStatusForService('spark-hybrid-impinterop', response.clusterList.value)),
                  setup: statusInFMS && statusInFMS.enabled,
                });
              }
              if (Authinfo.isEntitled(Config.entitlements.mediafusion)) {
                statusInFMS = _.find(serviceStatuses, function (service) {
                  return service.id === 'squared-fusion-media';
                });
                card.serviceList.push({
                  serviceId: 'squared-fusion-media',
                  cssClass: HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-media', response.clusterList.value)),
                  setup: statusInFMS && statusInFMS.enabled,
                });
              }
              if (Authinfo.isEntitled(Config.entitlements.hds)) {
                statusInFMS = _.find(serviceStatuses, function (service) {
                  return service.id === 'spark-hybrid-datasecurity';
                });
                card.serviceList.push({
                  serviceId: 'spark-hybrid-datasecurity',
                  cssClass: HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(HybridServicesClusterService.processClustersToAggregateStatusForService('spark-hybrid-datasecurity', response.clusterList.value)),
                  setup: statusInFMS && statusInFMS.enabled,
                });
              }
              if (Authinfo.isEntitled(Config.entitlements.context)) {
                statusInFMS = _.find(serviceStatuses, function (service) {
                  return service.id === 'contact-center-context';
                });
                card.serviceList.push({
                  serviceId: 'contact-center-context',
                  cssClass: HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(HybridServicesClusterService.processClustersToAggregateStatusForService('contact-center-context', response.clusterList.value)),
                  setup: statusInFMS && statusInFMS.enabled,
                });
              }
            } else {
              if (_.get(response, 'clusterList.reason.status') === 403 && Authinfo.isCustomerLaunchedFromPartner()) {
                Notification.errorWithTrackingId(response.clusterList.reason, 'overview.cards.hybrid.herculesErrorAuthentication');
              } else {
                Notification.errorWithTrackingId(response.clusterList.reason, 'overview.cards.hybrid.herculesError');
              }
            }
            card.enabled = _.some(card.serviceList, function (service) {
              return service.setup;
            });
            if (card.enabled) {
              _.each(card.serviceList, function (service) {
                service.UIstateLink = getUIStateLink(service.serviceId);
                service.healthStatus = service.cssClass;
              });
            }
          });
        }
        init();

        function getUIStateLink(serviceId) {
          if (serviceId === 'squared-fusion-uc') {
            return 'call-service.list';
          } else if (serviceId === 'squared-fusion-cal') {
            return 'calendar-service.list';
          } else if (serviceId === 'squared-fusion-media') {
            return 'media-service-v2.list';
          } else if (serviceId === 'squared-fusion-gcal') {
            return 'google-calendar-service.settings';
          } else if (serviceId === 'squared-fusion-o365') {
            return 'office-365-service.settings';
          } else if (serviceId === 'spark-hybrid-datasecurity') {
            return 'hds.list';
          } else if (serviceId === 'contact-center-context') {
            return 'context-resources';
          } else if (serviceId === 'spark-hybrid-impinterop') {
            return 'imp-service.list';
          }
        }
        return card;
      },
    };
  }
})();
