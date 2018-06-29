import testModule from './index';

const DELETE_BUTTON = 'button.close';
const ADD_BUTTON = '[name="addAgentInstallFile"]';
const AGENT_INSTALL_FILES = getJSONFixture('hcs/hcs-agent-install-files/hcs-agent-install-files-list.json');
describe('Component: agent-install-files', () => {
  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$modal',
      '$q',
      'HcsControllerService',
      'HcsSetupModalService',
    );

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$modal, 'open').and.returnValue(undefined);
    spyOn(this.HcsControllerService, 'listAgentInstallFile').and.returnValue(this.$q.resolve(AGENT_INSTALL_FILES));
    spyOn(this.HcsControllerService, 'getAgentInstallFile').and.returnValue(this.$q.resolve(AGENT_INSTALL_FILES[0]));
    this.compileComponent('hcsInstallFiles', {});
    spyOn(this.HcsSetupModalService, 'openSetupModal').and.returnValue(undefined);
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.installFilesList.length).toEqual(AGENT_INSTALL_FILES.length);
    expect(this.controller.installFilesList[0].fileInfo).toExist();
  });

  it('search function should work as expected', function () {
    this.controller.filteredList('Shashi');
    expect(this.controller.installFilesList.length).toEqual(1);
    this.controller.filteredList('');
    expect(this.controller.installFilesList.length).toEqual(AGENT_INSTALL_FILES.length);
  });

  it('should call the delete modal when delete is clicked', function () {
    this.view.find(DELETE_BUTTON).click();
    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('should call the addAgentInstall function and modal when button is clicked', function() {
    this.view.find(ADD_BUTTON).click();
    expect(this.HcsSetupModalService.openSetupModal).toHaveBeenCalled();
  });
});
