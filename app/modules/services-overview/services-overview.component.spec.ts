import componentModule from './index';

import { ServicesOverviewController } from 'modules/services-overview/services-overview.component';

describe('ServiceOverviewCtrl', () => {

  let $componentController: ng.IComponentControllerService, $httpBackend: ng.IHttpBackendService, $scope: ng.IScope;
  let ctrl: ServicesOverviewController;

  beforeEach(angular.mock.module(componentModule));
  beforeEach(angular.mock.module('HDS'));
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, _$httpBackend_, _$rootScope_, _PrivateTrunkPrereqService_ ) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    $scope = _$rootScope_.$new();
  }

  beforeEach(() => {
    $httpBackend.when('GET', /\/hercules\/api\/v2\/organizations/).respond({});
    $httpBackend.when('GET', /v1\/Users\/me/).respond({});
    $httpBackend.when('GET', 'https://identity.webex.com/organization/scim/v1/Orgs/1111').respond({});
  });


  function initController() {
    ctrl = $componentController('servicesOverview', {}, {});
    ctrl.$onInit();
    $scope.$apply();
  }

  describe('constructor', () => {
    it('should create 4 cloud cards', () => {
      initController();
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.message.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.call.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' }).length).toBe(1);
    });

    it('should create 8 hybrid cards', () => {
      initController();
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.clusterList.title' }).length).toBe(1);
      // 2 Hybrid Calendar cards (sharing the same title) but never displayed at the same time
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCalendar.title' }).length).toBe(2);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCall.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridDataSecurity.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridContext.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.privateTrunk.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridImp.title' }).length).toBe(1);
    });

    it('should create a cmc card', () => {
      initController();
      expect(_.filter(ctrl.getCmcCards(), { name: 'servicesOverview.cards.cmc.title' }).length).toBe(1);
    });
  });
});
