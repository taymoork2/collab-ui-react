import testModule from './index';
import { HcsSetupModalSelect } from 'modules/hcs/hcs-shared';

describe('Component: upgrade-sftp-list', () => {
  const SFTP_SERVER_LIST = getJSONFixture('hcs/hcs-upgrade/hcs-sftp-servers-list.json');
  const DELETE_BUTTON = 'button.close';
  const CARD = 'article';

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$modal',
      '$state',
      '$q',
      'HcsUpgradeService',
      'HcsSetupModalService',
      'CardUtils',
    );

    spyOn(this.$state, 'go').and.returnValue(undefined);
    spyOn(this.$modal, 'open').and.callThrough();
    spyOn(this.HcsUpgradeService, 'listSftpServers').and.returnValue(this.$q.resolve(SFTP_SERVER_LIST));
    this.compileComponent('hcsUpgradeSftpList', {});
    spyOn(this.controller, 'reInstantiateMasonry').and.callThrough();
    spyOn(this.CardUtils, 'resize').and.callThrough();
    spyOn(this.HcsSetupModalService, 'openSetupModal').and.returnValue(undefined);
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.currentSftpList.length).toEqual(3);
  });

  it('search feature should work as expected', function () {
    this.controller.filteredList('RCDN');
    expect(this.controller.currentSftpList.length).toEqual(1);
    expect(this.controller.reInstantiateMasonry).toHaveBeenCalled();
    expect(this.CardUtils.resize).toHaveBeenCalled();
    this.controller.filteredList('abcs');
    expect(this.controller.currentSftpList.length).toEqual(0);
    expect(this.controller.reInstantiateMasonry).toHaveBeenCalled();
    expect(this.CardUtils.resize).toHaveBeenCalled();
    this.controller.filteredList('');
    expect(this.controller.currentSftpList.length).toEqual(3);
    expect(this.controller.reInstantiateMasonry).toHaveBeenCalled();
    expect(this.CardUtils.resize).toHaveBeenCalled();
  });

  it('add sftp feature should work as expected', function () {
    this.controller.addSftp();
    expect(this.HcsSetupModalService.openSetupModal).toHaveBeenCalledWith(false, HcsSetupModalSelect.SftpServerSetup);
  });

  it('delete feature should work as expected', function () {
    this.view.find(DELETE_BUTTON).click();
    expect(this.$modal.open).toHaveBeenCalled();
  });
  it('edit feature should work as expected', function () {
    this.view.find(CARD).click();
    expect(this.$state.go).toHaveBeenCalled();
  });
});
