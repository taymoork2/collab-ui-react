import { ServicesOverviewCtrl } from './servicesOverview.controller';

describe('ServiceOverviewCtrl', () => {

  let $controller, $httpBackend, $scope;
  let ctrl: ServicesOverviewCtrl;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(() => {
    $httpBackend.when('GET', /\/hercules\/api\/v2\/organizations/).respond({});
    $httpBackend.when('GET', /v1\/Users\/me/).respond({});
  });

  function dependencies(_$controller_, _$httpBackend_, _$rootScope_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $scope = _$rootScope_.$new();
  }

  function initController() {
    ctrl = $controller('ServicesOverviewCtrl');
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

    it('should create 7 hybrid cards', () => {
      initController();
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.clusterList.title' }).length).toBe(1);
      // 2 Hybrid Calendar cards (sharing the same title) but never displayed at the same time
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCalendar.title' }).length).toBe(2);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCall.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridDataSecurity.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridContext.title' }).length).toBe(1);
    });
  });
});
