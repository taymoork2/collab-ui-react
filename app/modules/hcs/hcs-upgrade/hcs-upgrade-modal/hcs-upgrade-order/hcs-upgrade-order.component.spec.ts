import testModule from '../index';

describe('Component: HCS Upgrade Order Modal', () => {
  const nodes = {
    upgradeOrder : [ {
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
  };

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$scope',
      'HcsUpgradeService',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    spyOn(this.HcsUpgradeService, 'getUpgradeOrder').and.returnValue(this.$q.resolve(_.cloneDeep(nodes)));

    this.compileComponent('hcsUpgradeOrder', {
      clusterUuid: '123',
      onChangeFn: 'onChangeFn()',
    });
  });

  it('should get upgrade order', function () {
    expect(this.HcsUpgradeService.getUpgradeOrder).toHaveBeenCalledWith('123');
    expect(this.controller.cluster).toEqual(nodes.upgradeOrder);
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('should move node up', function () {
    this.controller.moveUp(2, 0);

    expect(this.controller.cluster).toEqual([ {
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
      }, {
        uuid : '098',
        hostName : 'UCM2-SUB-1A.ciscoctg.com',
        type : 'CUCM',
        nodeUuid : '876',
        pub : false,
      } ],
    }, {
      orderNumber : 3,
      nodes : [  ],
    } ]);
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('should reset and move node down', function () {
    this.controller.moveDown(1, 0);
    expect(this.controller.cluster).toEqual([ {
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
      }, {
        uuid : '789',
        hostName : 'UCM2-SUB-1B.ciscoctg.com',
        type : 'CUCM',
        nodeUuid : '135',
        pub : false,
      } ],
    } ]);

    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('should should try to move pub and fail', function () {
    const pub = this.controller.canMoveUp(this.controller.cluster[1].nodes[1], 1);

    expect(pub).toEqual(false);
  });

  it('should should handle up and down arrows on nodes', function () {
    spyOn(this.controller, 'moveDown');
    spyOn(this.controller, 'moveUp');
    this.controller.handleKeyPress(40, this.controller.cluster[1].nodes[0], 1, 0);
    expect(this.controller.moveDown).toHaveBeenCalled();

    this.controller.handleKeyPress(38, this.controller.cluster[2].nodes[0], 2, 0);
    expect(this.controller.moveUp).toHaveBeenCalled();
  });
});
