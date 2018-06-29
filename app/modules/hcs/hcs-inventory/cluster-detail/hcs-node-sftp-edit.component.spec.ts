import testModule from './index';

describe('Component: node-sftp-edit', () => {
  const CLUSTER_DETAIL = getJSONFixture('hcs/hcs-inventory/hcs-cluster-detail.json');
  const SFTP_SERVER_OPTIONS = getJSONFixture('hcs/hcs-upgrade/hcs-sftp-server-select-options.json');
  const CANCEL_BUTTON = 'button.btn.btn-default';
  const CLOSE_BUTTON = 'button.close';

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$scope',
      '$q',
      'HcsUpgradeService',
    );
    spyOn(this.$translate, 'instant').and.callThrough();

    this.$scope.emptyFunction = _.noop;
    this.compileComponent('hcsNodeSftpEdit', {
      refreshData: 'emptyFunction',
      dismiss: 'emptyFunction',
      node: CLUSTER_DETAIL.nodes[0],
      sftpServers: SFTP_SERVER_OPTIONS,
    });
    spyOn(this.controller, 'cancel').and.callThrough();
    spyOn(this.controller, 'dismiss').and.returnValue(undefined);
    spyOn(this.controller, 'refreshData').and.returnValue(undefined);
    spyOn(this.HcsUpgradeService, 'updateNodeSftp').and.returnValue(this.$q.resolve(null));
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.sftpServerSelected).toEqual({ label: '', value: '' });
  });

  it('should trigger cancel fucntion on cancel button click', function () {
    this.view.find(CANCEL_BUTTON).click();
    expect(this.controller.cancel).toHaveBeenCalled();
    expect(this.controller.dismiss).toHaveBeenCalled();
  });

  it('should trigger cancel fucntion on close button click', function () {
    this.view.find(CLOSE_BUTTON).click();
    expect(this.controller.cancel).toHaveBeenCalled();
    expect(this.controller.dismiss).toHaveBeenCalled();
  });

  it('should be able to save the sftp server', function () {
    this.controller.sftpServerSelected = SFTP_SERVER_OPTIONS[0];
    this.controller.save();
    this.$scope.$apply();
    expect(this.HcsUpgradeService.updateNodeSftp).toHaveBeenCalledWith(CLUSTER_DETAIL.nodes[0].uuid, {
      sftpServerUuid: SFTP_SERVER_OPTIONS[0].value,
      name: SFTP_SERVER_OPTIONS[0].label,
    });
    expect(this.controller.refreshData).toHaveBeenCalled();
    expect(this.controller.dismiss).toHaveBeenCalled();
  });
});
