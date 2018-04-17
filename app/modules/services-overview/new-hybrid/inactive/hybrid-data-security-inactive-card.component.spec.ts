import componentModule from '../../index';

import { ProPackService } from '../../../core/proPack/proPack.service';
import { HybridDataSecurityInactiveCardController } from 'modules/services-overview/new-hybrid/inactive/hybrid-data-security-inactive-card.component';

describe('Component: HybridDataSecurityInactiveCardController', () => {
  let $componentController: ng.IComponentControllerService;
  let $q: ng.IQService;
  let $scope: ng.IScope;
  let ctrl: HybridDataSecurityInactiveCardController;
  let HDSService;
  let ProPackService: ProPackService;
  let enableHdsEntitlement: jasmine.Spy;
  let hasProPackEnabled: jasmine.Spy;
  let hasProPackPurchased: jasmine.Spy;

  beforeEach(angular.mock.module(componentModule));
  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, _$q_, _$rootScope_, _HDSService_, _ProPackService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HDSService = _HDSService_;
    ProPackService = _ProPackService_;

    enableHdsEntitlement = spyOn(HDSService, 'enableHdsEntitlement').and.returnValue($q.resolve());
    hasProPackEnabled = spyOn(ProPackService, 'hasProPackEnabled').and.returnValue($q.resolve(false));
    hasProPackPurchased = spyOn(ProPackService, 'hasProPackPurchased').and.returnValue($q.resolve(false));
  }

  function initController() {
    ctrl = $componentController('hybridDataSecurityInactiveCard', {}, {});
    $scope.$apply();
  }

  describe('constructor', () => {
    it('should have sane defaults', () => {
      initController();
      expect(ctrl.loading).toBe(true);
      expect(ctrl.treatAsPurchased).toBe(false);
    });
  });

  describe('$onInit', () => {
    it('should fetch ProPack information and update loading', () => {
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(hasProPackEnabled).toHaveBeenCalled();
      expect(hasProPackPurchased).toHaveBeenCalled();
      expect(ctrl.loading).toBe(false);
    });

    it('should treat as purchased if Pro Pack Purchased', () => {
      hasProPackPurchased.and.returnValue($q.resolve(true));
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.treatAsPurchased).toBe(true);
    });

    it('should not treat as purchased if feature toggle on and not purchased', () => {
      hasProPackEnabled.and.returnValue($q.resolve(true));
      hasProPackPurchased.and.returnValue($q.resolve(false));
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.treatAsPurchased).toBe(false);
    });
  });

  describe('openSetUp()', () => {
    it('should call enableHdsEntitlement', () => {
      initController();
      ctrl.openSetUp();
      expect(enableHdsEntitlement).toHaveBeenCalled();
    });
  });
});
