import privateTrunkSidepanel from './index';

describe('Component: PrivateTrunkSidepanelComponent ', () => {

  describe('Template: ', () => {

    beforeEach(function () {
      this.initModules(privateTrunkSidepanel);
      this.injectDependencies(
        '$q',
        'EnterprisePrivateTrunkService',
      );
      spyOn(this.EnterprisePrivateTrunkService, 'getTrunk').and.returnValue({});
      this.compileComponent('private-trunk-sidepanel');
    });

    it('should contain an alarm-list-section element and pass on an alarm list and the correct connector type', function() {
      expect(this.view.find('alarm-list-section')[0].outerHTML).toContain('<alarm-list-section ');
      expect(this.view.find('alarm-list-section')[0].outerHTML).toContain('alarms="$ctrl.alarms"');
      expect(this.view.find('alarm-list-section')[0].outerHTML).toContain('connector-type="\'ept\'"');
    });

    it('should contain a private-trunk-addresses-status element and pass on a destination-list', function() {
      expect(this.view.find('private-trunk-addresses-status')[0].outerHTML).toContain('<private-trunk-addresses-status ');
      expect(this.view.find('private-trunk-addresses-status')[0].outerHTML).toContain('destination-list="$ctrl.destinations"');
    });

  });

  describe('Controller: ', () => {

    let $componentController, $scope, EnterprisePrivateTrunkService, ctrl;

    beforeEach(function () {
      this.initModules(privateTrunkSidepanel);
    });

    beforeEach(inject((_$componentController_, $rootScope, _EnterprisePrivateTrunkService_) => {
      $componentController = _$componentController_;
      $scope = $rootScope.$new();
      EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
    }));

    beforeEach(initSpies);
    function initSpies(): void {
      spyOn(EnterprisePrivateTrunkService, 'getTrunk').and.returnValue({});
    }

    const trunkId = '1234';

    function initController() {
      ctrl = $componentController('privateTrunkSidepanel', {
        $scope: $scope,
        EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
      }, { trunkId: trunkId });
    }

    it('should call EnterprisePrivateTrunkService to get data', () => {
      initController();
      ctrl.$onInit();
      $scope.$apply();
      expect(EnterprisePrivateTrunkService.getTrunk).toHaveBeenCalledWith(trunkId);
    });

  });

});
