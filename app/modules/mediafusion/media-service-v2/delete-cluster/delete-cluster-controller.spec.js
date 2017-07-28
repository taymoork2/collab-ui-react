'use strict';

describe('Controller: DeleteClusterSettingControllerV2', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$filter',
      '$controller',
      '$q',
      '$scope',
      '$state',
      'HybridServicesClusterService',
      'MediaClusterServiceV2');

    this.jsonData = getJSONFixture('mediafusion/json/delete-cluster.json');
    this.selectString = 'Select a cluster';

    spyOn(this.HybridServicesClusterService, 'deregisterEcpNode').and.returnValue(this.$q.resolve({}));
    spyOn(this.MediaClusterServiceV2, 'get').and.returnValue({ then: _.noop });
    spyOn(this.MediaClusterServiceV2, 'getAll').and.returnValue({ then: _.noop });
    spyOn(this.MediaClusterServiceV2, 'moveV2Host').and.returnValue(this.$q.resolve({}));
    spyOn(this.MediaClusterServiceV2, 'createClusterV2').and.returnValue(this.$q.resolve({}));
    spyOn(this.MediaClusterServiceV2, 'deleteV2Cluster').and.returnValue(this.$q.resolve({}));
    spyOn(this.$state, 'go');

    this.$modalInstance = {
      close: jasmine.createSpy('close'),
    };

    this.initController = function () {
      this.controller = this.$controller('DeleteClusterSettingControllerV2', {
        cluster: _.cloneDeep(this.jsonData.cluster),
        $modalInstance: this.$modalInstance,
        $filter: this.$filter,
        MediaClusterServiceV2: this.MediaClusterServiceV2,
        $state: this.$state,
        $q: this.$q,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('check if the moveV2Host of MediaClusterServiceV2 is invoked', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = _.cloneDeep(this.jsonData.hosts);

    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = _.cloneDeep(this.jsonData.selectModel);
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);

    this.controller.continue();
    expect(this.controller.isMove).toBe(true);
    this.$scope.$apply();
    expect(this.MediaClusterServiceV2.moveV2Host).toHaveBeenCalled();
    expect(this.MediaClusterServiceV2.moveV2Host.calls.count()).toEqual(2);
  });

  it('check if the createClusterV2 of MediaClusterServiceV2 is invoked', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = _.cloneDeep(this.jsonData.hosts);

    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = _.cloneDeep(this.jsonData.selectModel2);
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);

    this.controller.continue();
    expect(this.controller.isMove).toBe(true);
    this.$scope.$apply();
    expect(this.MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
    expect(this.MediaClusterServiceV2.createClusterV2.calls.count()).toEqual(2);
  });

  it('should invoke HybridServicesClusterService.deregisterEcpNode when a node is being deregistered', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = _.cloneDeep(this.jsonData.hosts);

    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = _.cloneDeep(this.jsonData.selectModel);
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);

    this.controller.deleteCluster();
    this.$scope.$apply();
    expect(this.controller.isMove).toBe(true);
    expect(this.HybridServicesClusterService.deregisterEcpNode.calls.count()).toEqual(2);
  });

  it('check if the moveV2Host of MediaClusterServiceV2 is not invoked if the target cluster is not selected', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = _.cloneDeep(this.jsonData.hosts);

    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = _.cloneDeep(this.jsonData.selectModel);
    this.controller.selectModel['10.196.5.246'] = this.selectString;
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);

    this.controller.continue();
    expect(this.controller.isMove).toBe(true);
    expect(this.MediaClusterServiceV2.moveV2Host).not.toHaveBeenCalled();
    expect(this.MediaClusterServiceV2.moveV2Host.calls.count()).toEqual(0);
  });

  it('check if the deleteV2Cluster of MediaClusterServiceV2 is invoked for empty cluster', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = [];
    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = {};
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);
    this.controller.successCount = 0;
    this.controller.errorCount = 0;
    this.controller.noOfHost = 0;

    this.controller.continue();
    this.$scope.$apply();
    expect(this.controller.isMove).toBe(true);
    expect(this.MediaClusterServiceV2.deleteV2Cluster).toHaveBeenCalled();
    expect(this.MediaClusterServiceV2.deleteV2Cluster.calls.count()).toEqual(1);
  });

  it('check if the deleteV2Cluster of MediaClusterServiceV2 is invoked when errorCount is present', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = [];
    this.controller.failedToDelete = false;
    this.controller.ngDisable = false;
    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = {};
    this.controller.failedHostMove = {};
    this.controller.unableToMoveNodes = {};
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);
    this.controller.successCount = 5;
    this.controller.errorCount = 5;
    this.controller.noOfHost = 10;

    this.controller.continue();
    expect(this.controller.isMove).toBe(true);
    expect(this.MediaClusterServiceV2.deleteV2Cluster).not.toHaveBeenCalled();
    expect(this.controller.failedToDelete).toBe(true);
  });

  it('should invoke HybridServicesClusterService.deregisterEcpNode when a cluster is being deleted', function () {
    this.controller.cluster = _.cloneDeep(this.jsonData.cluster);
    this.controller.hosts = _.cloneDeep(this.jsonData.hosts);
    this.controller.selectPlaceholder = this.selectString;
    this.controller.fillModel = {};
    this.controller.selectModel = _.cloneDeep(this.jsonData.selectModel);
    this.controller.clusters = _.cloneDeep(this.jsonData.clusters);

    this.controller.deleteCluster();
    expect(this.controller.isMove).toBe(true);
    expect(this.HybridServicesClusterService.deregisterEcpNode.calls.count()).toEqual(2);
  });

  it('DeleteClusterSettingControllerV2 canContinue should enable continue button when the feild is filled', function () {
    this.controller.hosts = _.cloneDeep(this.jsonData.hosts);
    this.controller.canContinue();
    expect(this.controller.canContinue()).toBeTruthy();
  });
});
