import testModule from './index';
import { HcsUpgradeModalComponent } from './hcs-upgrade-modal.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { IToolkitModalService } from 'modules/core/modal';

type Test = atlas.test.IComponentTest<HcsUpgradeModalComponent, {
  $q: ng.IQService;
  $scope: ng.IScope;
  $modal: IToolkitModalService;
  HcsUpgradeService: HcsUpgradeService;
  $state: ng.ui.IStateService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  },
}>;

describe('Component: HCS Upgrade Modal', () => {
  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      testModule,
      'Core',
      this.components.multiStepModal,
    );
    this.injectDependencies(
      '$scope',
      '$modal',
      '$state',
      'HcsUpgradeService',
    );

    spyOn(this.HcsUpgradeService, 'saveUpgradeOrder').and.returnValue(this.$q.resolve({}));
    spyOn(this.HcsUpgradeService, 'startTasks').and.returnValue(this.$q.resolve({}));

    this.compileComponent('hcsUpgradeModal', {
      clusterUuid: '123',
      dismiss: _.noop(),
      clusterName: 'hi',
      currentVersion: 'this',
      upgradeTo: 'is',
      customerId: 'test',
    });
  });

  it('should init on info page', function () {
    expect(this.controller.currentStepIndex).toEqual(1);
  });

  it('should advance to upgrade order', function () {
    this.controller.upgradeStep();
    expect(this.controller.currentStepIndex).toEqual(2);
  });

  it('should save upgrade order and start upgrade task', function () {
    this.controller.upgradeOrder = [ {
      orderNumber : 1,
      nodes : [ {
        uuid : '123',
        hostName : 'UCM2-PUB.ciscoctg.com',
        type : 'CUCM',
        nodeUuid : '456',
        pub : true,
      } ],
    }, {
      orderNumber : 2,
      nodes : [ {
        uuid : '789',
        hostName : 'UCM2-SUB-1B.ciscoctg.com',
        type : 'CUCM',
        nodeUuid : '135',
        pub : false,
      }, {
        uuid : '321',
        hostName : 'IMP2-PUB.ciscoctg.com',
        type : 'IM&P',
        nodeUuid : '654',
        pub : true,
      } ],
    }, {
      orderNumber : 3,
      nodes : [ {
        uuid : '098',
        hostName : 'UCM2-SUB-1A.ciscoctg.com',
        type : 'CUCM',
        nodeUuid : '876',
        pub : false,
      } ],
    } ],
    spyOn(this.controller, 'getNodeIds');
    this.controller.saveUpgradeOrder();
    expect(this.controller.getNodeIds).toHaveBeenCalled();
    expect(this.HcsUpgradeService.saveUpgradeOrder).toHaveBeenCalled();
    this.$scope.$apply();
    expect(this.HcsUpgradeService.startTasks).toHaveBeenCalledWith('123', 'upgrade');
  });

  it('should run prechecks', function () {
    spyOn(this.$modal, 'open');
    this.controller.runPrechecks();
    expect(this.$modal.open).toHaveBeenCalled();
  });
});
