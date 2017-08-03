import { ServicesOverviewHybridAndGoogleCalendarCard } from './hybridAndGoogleCalendarCard';

describe('ServicesOverviewHybridCallCard', () => {

  let $state, $q, $modal, $rootScope, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification;
  let card: ServicesOverviewHybridAndGoogleCalendarCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$state_, _$q_, _$modal_, _$rootScope_, _Authinfo_, _CloudConnectorService_, _HybridServicesClusterStatesService_, _Notification_) {
    $state = _$state_;
    $q = _$q_;
    $modal = _$modal_;
    $rootScope = _$rootScope_;
    Authinfo = _Authinfo_;
    CloudConnectorService = _CloudConnectorService_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
    Notification = _Notification_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionCal');
    spyOn(Authinfo, 'isFusionGoogleCal');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({ setup: true }));
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    expect(card.active).toBe(false);
    expect(card.googleActive).toBe(false);
    expect(card.loading).toBe(true);
  });

  // no org should have the google calendar entitlement without having the microsoft exchange one
  // we don't have a card for "just google calendar"
  it('should not be displayed if the user does not have the hybrid cal entitlement but has the hybrid google cal entitlement', () => {
    Authinfo.isFusionCal.and.returnValue(false);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    expect(card.display).toBe(false);
  });

  it('should be displayed if the user has the hybrid cal entitlement and the hybrid google cal entitlement', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    expect(card.display).toBe(true);
  });

  it('should not be displayed if the user does has neither the hybrid cal entitlement nor the hybrid google cal entitlement ', () => {
    Authinfo.isFusionCal.and.returnValue(false);
    Authinfo.isFusionGoogleCal.and.returnValue(false);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    expect(card.display).toBe(false);
  });

  it('should stay not active if services statuses do not say hybrid calendar is setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-cal', setup: false, status: 'yolo' }]);
    $rootScope.$apply();
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say hybrid calendar is setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-cal', setup: true, status: 'yolo' }]);
    $rootScope.$apply();
    expect(card.active).toBe(true);
  });

  it('should stay not googleActive if CloudConnectorService says service not setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    CloudConnectorService.getService.and.returnValue($q.resolve({ setup: false }));
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    card.hybridStatusEventHandler([]);
    $rootScope.$apply();
    expect(card.googleActive).toBe(false);
  });

  it('should be googleActive if CloudConnectorService says service setup', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    CloudConnectorService.getService.and.returnValue($q.resolve({ setup: true }));
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    card.hybridStatusEventHandler([]);
    $rootScope.$apply();
    expect(card.googleActive).toBe(true);
  });

  it('should stop loading once it received the hybrid statuses', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    card.hybridStatusEventHandler([]);
    $rootScope.$apply();
    expect(card.loading).toBe(false);
  });

  it('should pop a notification and disable the button if something goes wrong in the CCC service', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    CloudConnectorService.getService.and.returnValue($q.reject());
    card = new ServicesOverviewHybridAndGoogleCalendarCard($state, $q, $modal, Authinfo, CloudConnectorService, HybridServicesClusterStatesService, Notification);
    card.hybridStatusEventHandler([]);
    $rootScope.$apply();
    expect(card.googleServerError).toBe(true);
    expect(Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
  });

});
