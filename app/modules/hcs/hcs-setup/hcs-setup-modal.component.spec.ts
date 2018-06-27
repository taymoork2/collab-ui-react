import testModule from './index';
import { HcsSetupModalComponent } from './hcs-setup-modal.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { HcsUpgradeService, HcsSetupModalService, HcsControllerService, HcsSetupModalSelect } from 'modules/hcs/hcs-shared';
import { IToolkitModalService } from 'modules/core/modal';
import { Authinfo } from 'modules/core/scripts/services/authinfo';

const AGENT_INSTALL_FILES = getJSONFixture('hcs/hcs-agent-install-files/hcs-agent-install-files-list.json');
const SFTP_SERVER_LIST = getJSONFixture('hcs/hcs-upgrade/hcs-sftp-servers-list.json');
const SW_PROFILE_DETAIL = getJSONFixture('hcs/hcs-upgrade/hcs-sw-profile-detail.json');

type Test = atlas.test.IComponentTest<HcsSetupModalComponent, {
  $q: ng.IQService;
  $scope: ng.IScope;
  $modal: IToolkitModalService;
  HcsUpgradeService: HcsUpgradeService;
  HcsSetupModalService: HcsSetupModalService;
  HcsControllerService: HcsControllerService;
  $state: ng.ui.IStateService;
  Authinfo: Authinfo;
  Auth: any;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  },
}>;

describe('Component: hcs-setup-modal', () => {

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(testModule, 'Core', this.components.multiStepModal);
    this.injectDependencies(
      '$q',
      '$state',
      '$scope',
      'HcsSetupModalService',
      'HcsUpgradeService',
      'HcsControllerService',
      'Authinfo',
      'Auth',
    );
  });

  describe('first time setup flow', () => {
    beforeEach(function () {
      this.$scope.isFirstTimeSetup = true;
      spyOn(this.$state, 'go').and.returnValue(undefined);
      this.compileComponent('hcsSetupModal', {
        isFirstTimeSetup: 'isFirstTimeSetup',
      });
      spyOn(this.controller, 'createHcsPartner').and.callThrough();
      spyOn(this.controller, 'createInstallFile').and.callThrough();
      spyOn(this.controller, 'createSftp').and.callThrough();
      spyOn(this.controller, 'createSoftwareProfile').and.callThrough();
      spyOn(this.controller, 'dismissModal').and.callThrough();
      spyOn(this.HcsControllerService, 'createHcsPartner').and.returnValue(this.$q.resolve(undefined));
      spyOn(this.HcsControllerService, 'updateUserEntitlement').and.returnValue(this.$q.resolve(undefined));
      spyOn(this.HcsControllerService, 'createAgentInstallFile').and.returnValue(this.$q.resolve(undefined));
      spyOn(this.HcsUpgradeService, 'createSftpServer').and.returnValue(this.$q.resolve(undefined));
      spyOn(this.HcsUpgradeService, 'createSoftwareProfile').and.returnValue(this.$q.resolve(undefined));
      spyOn(this.Authinfo, 'getUserId').and.returnValue('12345');
      spyOn(this.HcsSetupModalService, 'dismissModal').and.returnValue(undefined);
      spyOn(this.Auth, 'getAccessTokenWithNewScope').and.returnValue(this.$q.resolve(undefined));
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.currentStepIndex).toEqual(1);
      expect(this.controller.title).toEqual('hcs.setup.titleServices');
    });

    it('should complete first time setup flow', function () {
      this.controller.selectHcsService({ license: false, upgrade: true });
      this.controller.nextStep();
      this.$scope.$apply();
      expect(this.controller.createHcsPartner).toHaveBeenCalled();
      expect(this.controller.currentStepIndex).toEqual(2);
      expect(this.controller.title).toEqual('hcs.installFiles.setupTitle');
      expect(this.HcsControllerService.createHcsPartner).toHaveBeenCalled();
      expect(this.HcsControllerService.updateUserEntitlement).toHaveBeenCalledWith('12345', ['ucmgmt-uaas']);
      this.controller.setAgentInstallFile(AGENT_INSTALL_FILES[0]);
      this.controller.nextStep();
      expect(this.controller.createInstallFile).toHaveBeenCalled();
      expect(this.controller.currentStepIndex).toEqual(3);
      expect(this.controller.title).toEqual('hcs.sftp.setupTitle');
      expect(this.HcsControllerService.createAgentInstallFile).toHaveBeenCalledWith(AGENT_INSTALL_FILES[0]);
      this.controller.setSftpServer(SFTP_SERVER_LIST.sftpServers[0]);
      this.controller.nextStep();
      expect(this.controller.createSftp).toHaveBeenCalled();
      expect(this.controller.currentStepIndex).toEqual(4);
      expect(this.controller.title).toEqual('hcs.softwareProfiles.title');
      expect(this.HcsUpgradeService.createSftpServer).toHaveBeenCalledWith(SFTP_SERVER_LIST.sftpServers[0]);
      this.controller.setSoftwareProfile(SW_PROFILE_DETAIL);
      this.controller.nextStep();
      expect(this.controller.createSoftwareProfile).toHaveBeenCalled();
      expect(this.controller.currentStepIndex).toEqual(5);
      expect(this.controller.title).toEqual('hcs.setup.finish');
      expect(this.HcsUpgradeService.createSoftwareProfile).toHaveBeenCalledWith(SW_PROFILE_DETAIL);
      this.controller.finishModal();
      expect(this.controller.dismissModal).toHaveBeenCalled();
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.HcsSetupModalService.dismissModal).toHaveBeenCalled();
    });
  });

  describe('add agent install file flow', () => {
    beforeEach(function () {
      this.$scope.isFirstTimeSetup = false;
      this.$scope.currentStepIndex = HcsSetupModalSelect.AgentInstallFileSetup;
      spyOn(this.$state, 'go').and.returnValue(undefined);
      this.compileComponent('hcsSetupModal', {
        isFirstTimeSetup: 'isFirstTimeSetup',
        currentStepIndex: 'currentStepIndex',
      });
      spyOn(this.controller, 'createInstallFile').and.callThrough();
      spyOn(this.controller, 'dismissModal').and.callThrough();
      spyOn(this.HcsControllerService, 'createAgentInstallFile').and.returnValue(this.$q.resolve(undefined));
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.currentStepIndex).toEqual(2);
      expect(this.controller.title).toEqual('hcs.installFiles.setupTitle');
    });

    it('should complete create agent install file flow', function () {
      this.controller.setAgentInstallFile(AGENT_INSTALL_FILES[0]);
      this.controller.finishModal();
      this.$scope.$apply();
      expect(this.controller.createInstallFile).toHaveBeenCalled();
      expect(this.HcsControllerService.createAgentInstallFile).toHaveBeenCalledWith(AGENT_INSTALL_FILES[0]);
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.controller.dismissModal).toHaveBeenCalled();
    });
  });

  describe('add sftp server flow', () => {
    beforeEach(function () {
      this.$scope.isFirstTimeSetup = false;
      this.$scope.currentStepIndex = HcsSetupModalSelect.SftpServerSetup;
      spyOn(this.$state, 'go').and.returnValue(undefined);
      this.compileComponent('hcsSetupModal', {
        isFirstTimeSetup: 'isFirstTimeSetup',
        currentStepIndex: 'currentStepIndex',
      });
      spyOn(this.controller, 'createSftp').and.callThrough();
      spyOn(this.controller, 'dismissModal').and.callThrough();
      spyOn(this.HcsUpgradeService, 'createSftpServer').and.returnValue(this.$q.resolve(undefined));
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.currentStepIndex).toEqual(3);
      expect(this.controller.title).toEqual('hcs.sftp.setupTitle');
    });

    it('should complete create sftp server flow', function () {
      this.controller.setSftpServer(SFTP_SERVER_LIST.sftpServers[0]);
      this.controller.finishModal();
      this.$scope.$apply();
      expect(this.controller.createSftp).toHaveBeenCalled();
      expect(this.HcsUpgradeService.createSftpServer).toHaveBeenCalledWith(SFTP_SERVER_LIST.sftpServers[0]);
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.controller.dismissModal).toHaveBeenCalled();
    });
  });

  describe('add software profile flow', () => {
    beforeEach(function () {
      this.$scope.isFirstTimeSetup = false;
      this.$scope.currentStepIndex = HcsSetupModalSelect.SoftwareProfileSetup;
      spyOn(this.$state, 'go').and.returnValue(undefined);
      this.compileComponent('hcsSetupModal', {
        isFirstTimeSetup: 'isFirstTimeSetup',
        currentStepIndex: 'currentStepIndex',
      });
      spyOn(this.controller, 'createSoftwareProfile').and.callThrough();
      spyOn(this.controller, 'dismissModal').and.callThrough();
      spyOn(this.HcsUpgradeService, 'createSoftwareProfile').and.returnValue(this.$q.resolve(undefined));
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.currentStepIndex).toEqual(4);
      expect(this.controller.title).toEqual('hcs.softwareProfiles.title');
    });

    it('should complete create software profile flow', function () {
      this.controller.setSoftwareProfile(SW_PROFILE_DETAIL);
      this.controller.finishModal();
      this.$scope.$apply();
      expect(this.controller.createSoftwareProfile).toHaveBeenCalled();
      expect(this.HcsUpgradeService.createSoftwareProfile).toHaveBeenCalledWith(SW_PROFILE_DETAIL);
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.controller.dismissModal).toHaveBeenCalled();
    });
  });
});
