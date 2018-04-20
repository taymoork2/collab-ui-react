import componentModule from '../../index';

import { PrivateTrunkPrereqService } from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import { EPTInactiveCardController } from 'modules/services-overview/new-hybrid/inactive/ept-inactive-card.component';

describe('Component: EPTInactiveCardController', () => {
  let $componentController: ng.IComponentControllerService;
  let $q: ng.IQService;
  let $scope: ng.IScope;
  let ctrl: EPTInactiveCardController;
  let PrivateTrunkPrereqService: PrivateTrunkPrereqService;
  let getVerifiedDomains: jasmine.Spy;

  beforeEach(angular.mock.module(componentModule));
  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, _$q_, _$rootScope_, _PrivateTrunkPrereqService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    PrivateTrunkPrereqService = _PrivateTrunkPrereqService_;

    getVerifiedDomains = spyOn(PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue($q.resolve([]));
    spyOn(PrivateTrunkPrereqService, 'openPreReqModal');
    spyOn(PrivateTrunkPrereqService, 'openSetupModal');
  }

  function initController() {
    ctrl = $componentController('eptInactiveCard', {}, {});
    $scope.$apply();
  }

  describe('constructor', () => {
    it('should have sane defaults', () => {
      initController();
      expect(ctrl.loading).toBe(true);
      expect(ctrl.canSetup).toBe(false);
    });
  });

  describe('$onInit', () => {
    it('should fetch domains and update loading', () => {
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(getVerifiedDomains).toHaveBeenCalled();
      expect(ctrl.loading).toBe(false);
    });

    it('should disable the set up button if no trunks yet', () => {
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.canSetup).toBe(false);
    });

    it('should enable the set up button if there are trunks', () => {
      getVerifiedDomains.and.returnValue($q.resolve(['a', 'b']));
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.canSetup).toBe(true);
    });
  });

  describe('openPrerequisites()', () => {
    it('should use PrivateTrunkPrereqService to open the right modal', () => {
      initController();
      ctrl.openPrerequisites();
      expect(PrivateTrunkPrereqService.openPreReqModal).toHaveBeenCalled();
    });
  });

  describe('openSetUp()', () => {
    it('should use PrivateTrunkPrereqService to open the right modal', () => {
      initController();
      ctrl.openSetUp();
      expect(PrivateTrunkPrereqService.openSetupModal).toHaveBeenCalled();
    });
  });
});
