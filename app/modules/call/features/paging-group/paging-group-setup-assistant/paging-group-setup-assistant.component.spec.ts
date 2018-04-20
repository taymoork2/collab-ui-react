import pagingGroupSetupAssistantModule from './index';

describe('Component: pgSetupAssistant', () => {

  const saveFailureResp = getJSONFixture('huron/json/features/pagingGroup/errorResponse.json');
  const pg = getJSONFixture('huron/json/features/pagingGroup/pg.json');
  const pgWithEmptyInit = getJSONFixture('huron/json/features/pagingGroup/pgWithEmptyInitiators.json');
  const pgWithMembersAndInitiators = getJSONFixture('huron/json/features/pagingGroup/pgWithMembersAndInitiators.json');
  const members = getJSONFixture('huron/json/features/pagingGroup/membersList2.json');

  beforeEach(function () {
    this.initModules(pagingGroupSetupAssistantModule);
    this.injectDependencies(
      '$timeout',
      '$modal',
      '$state',
      '$translate',
      '$q',
      'PagingGroupService',
      'HuronConfig',
      'Authinfo',
      'Notification',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.$state, 'go');
    spyOn(this.$modal, 'open');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');

    this.savePagingGroupDefer = this.$q.defer();
    spyOn(this.PagingGroupService, 'savePagingGroup').and.returnValue(this.savePagingGroupDefer.promise);
  });

  function initComponent() {
    this.compileComponent('pgSetupAssistant', {});
  }

  describe('lastIndex', () => {
    beforeEach(initComponent);

    it('should return 3', function () {
      expect(this.controller.lastIndex).toEqual(3);
    });
  });

  describe('getPageIndex', () => {
    beforeEach(initComponent);

    it('should return 0', function () {
      expect(this.controller.getPageIndex()).toEqual(0);
    });

    it('should return 1', function () {
      this.controller.index++;
      expect(this.controller.getPageIndex()).toEqual(1);
    });
  });

  describe('previousButton', () => {
    beforeEach(initComponent);

    it('should return hidden', function () {
      this.controller.index = 0;
      expect(this.controller.previousButton()).toEqual('hidden');
    });

    it('should return 1', function () {
      this.controller.index = 1;
      expect(this.controller.previousButton()).toBeTruthy();
    });
  });

  describe('nextButton', () => {
    beforeEach(initComponent);

    it('index = 0 and name empty should return false', function () {
      this.controller.index = 0;
      this.controller.name = '';
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 0, name not empty, isValid undefined should return false', function () {
      this.controller.index = 0;
      this.controller.name = pg.name;
      this.controller.isNameValid = undefined;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 0, name not empty, isValid false should return false', function () {
      this.controller.index = 0;
      this.controller.name = pg.name;
      this.controller.isNameValid = false;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 0, name not empty, isValid true should return true', function () {
      this.controller.index = 0;
      this.controller.name = pg.name;
      this.controller.isNameValid = true;
      expect(this.controller.nextButton()).toBeTruthy();
    });

    it('index = 1, number undefined should return false', function () {
      this.controller.index = 1;
      this.controller.number = '';
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, number defined, isValid undefined should return false', function () {
      this.controller.index = 1;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.isNumberValid = undefined;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, number defined, isValid false should return false', function () {
      this.controller.index = 1;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.isNumberValid = false;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, number defined, isValid true should return true', function () {
      this.controller.index = 1;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.isNumberValid = true;
      expect(this.controller.nextButton()).toBeTruthy();
    });

    it('index = 2, members undefined return false', function () {
      this.controller.index = 2;
      this.controller.selectedMembers = undefined;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 2, members empty array return false', function () {
      this.controller.index = 2;
      this.controller.selectedMembers = [];
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 2, at least one member return true', function () {
      this.controller.index = 2;
      this.controller.selectedMembers = members;
      expect(this.controller.nextButton()).toBeTruthy();
    });

    it('default case should return true', function () {
      this.controller.index = 3;
      expect(this.controller.nextButton()).toBeTruthy();
    });

    it('Test enterNextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(true);
      this.controller.enterNextPage(13);
      expect(this.controller.nextPage).toHaveBeenCalled();
    });
  });

  describe('previousPage', () => {
    beforeEach(initComponent);

    it('should change animation and index', function () {
      this.controller.index = 1;
      this.controller.previousPage();
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.animation).toEqual('slide-right');
      expect(this.controller.index).toEqual(0);
    });
  });

  describe('nextPage', () => {
    beforeEach(initComponent);

    it('should change animation and index', function () {
      this.controller.index = 0;
      this.controller.nextPage();
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.animation).toEqual('slide-left');
      expect(this.controller.index).toEqual(1);
    });
  });

  describe('nextText', () => {
    beforeEach(initComponent);

    it('should return pagingGroup.createHelpText', function () {
      expect(this.controller.nextText()).toEqual('pagingGroup.createHelpText');
    });
  });

  describe('evalKeyPress', () => {
    beforeEach(initComponent);

    it('escape key should call cancelModal', function () {
      spyOn(this.controller, 'cancelModal');
      this.controller.evalKeyPress(27);
      expect(this.controller.cancelModal).toHaveBeenCalled();
    });

    it('right arrow key and next button invalid should not call nextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(false);
      this.controller.evalKeyPress(39);
      expect(this.controller.nextPage).not.toHaveBeenCalled();
    });

    it('right arrow key and next button valid should call nextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(true);
      this.controller.evalKeyPress(39);
      expect(this.controller.nextPage).toHaveBeenCalled();
    });

    it('left arrow key and previous button invalid should not call previousPage', function () {
      spyOn(this.controller, 'previousPage');
      spyOn(this.controller, 'previousButton').and.returnValue(false);
      this.controller.evalKeyPress(37);
      expect(this.controller.previousPage).not.toHaveBeenCalled();
    });

    it('left arrow key and previous button valid should call previousPage', function () {
      spyOn(this.controller, 'previousPage');
      spyOn(this.controller, 'previousButton').and.returnValue(true);
      this.controller.evalKeyPress(37);
      expect(this.controller.previousPage).toHaveBeenCalled();
    });

    it('any key should call nothing', function () {
      spyOn(this.controller, 'previousPage');
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'cancelModal');
      this.controller.evalKeyPress(23);
      expect(this.controller.previousPage).not.toHaveBeenCalled();
      expect(this.controller.nextPage).not.toHaveBeenCalled();
      expect(this.controller.cancelModal).not.toHaveBeenCalled();
    });
  });

  describe('onUpdateName', () => {
    beforeEach(initComponent);

    it('should change name and isNameValid', function () {
      this.controller.onUpdateName('name', true);
      expect(this.controller.name).toEqual('name');
      expect(this.controller.isNameValid).toBeTruthy();
    });
  });

  describe('onUpdateNumber', () => {
    beforeEach(initComponent);

    it('should change number and isNumberValid', function () {
      const number: string =  pg.extension;
      this.controller.onUpdateNumber(number, true);
      expect(this.controller.number).toEqual(number);
      expect(this.controller.isNumberValid).toBeTruthy();
    });
  });

  describe('onUpdateMember', () => {
    beforeEach(initComponent);

    it('should change selectedMembers', function () {
      this.controller.onUpdateMember(members);
      expect(this.controller.selectedMembers).toEqual(members);
    });
  });

  describe('onUpdateInitiator', () => {
    beforeEach(initComponent);

    it('should change selectedInitiators', function () {
      this.controller.onUpdateInitiator('CUSTOM', members);
      expect(this.controller.selectedInitiators).toEqual(members);
    });
  });

  describe('savePagingGroup', () => {
    beforeEach(initComponent);

    it('should save with error if partial members saved', function () {
      const mem1 = _.cloneDeep(members[0]);
      const memWithPic = {
        member: mem1,
        picturePath: '',
      };
      this.savePagingGroupDefer.resolve(_.cloneDeep(pg));
      this.controller.name = pg.name;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.selectedMembers.push(memWithPic);
      this.controller.initiatorType = 'PUBLIC';
      this.controller.selectedInitiators = [];
      this.controller.savePagingGroup();
      this.$timeout.flush();
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorSaveMemberPartial', { pagingGroupName: pg.name, message: [ '0001' ] });
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should save with error if partial initiators saved', function () {
      const mem1 = _.cloneDeep(members[0]);
      const memWithPic = {
        member: mem1,
        picturePath: '',
      };
      this.savePagingGroupDefer.resolve(_.cloneDeep(pgWithEmptyInit));
      this.controller.name = pg.name;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.selectedMembers = [];
      this.controller.initiatorType = 'CUSTOM';
      this.controller.selectedInitiators.push(memWithPic);
      this.controller.savePagingGroup();
      this.$timeout.flush();
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorSaveInitiatorPartial', { pagingGroupName: pg.name, message: [ '0001' ] });
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should save with success', function () {
      const mem1 = _.cloneDeep(members[0]);
      const memWithPic1 = {
        member: mem1,
        picturePath: '',
      };
      const mem2 = _.cloneDeep(members[1]);
      const memWithPic2 = {
        member: mem2,
        picturePath: '',
      };
      this.savePagingGroupDefer.resolve(_.cloneDeep(pgWithMembersAndInitiators));
      this.controller.name = pgWithMembersAndInitiators.name;
      const numberData = {
        extension: '3223',
        extensionUUID: '8e33e338-0caa-4579-86df-38ef7590f432',
      };
      this.controller.number = numberData;
      this.controller.selectedMembers.push(memWithPic1);
      this.controller.selectedMembers.push(memWithPic2);
      this.controller.initiatorType = 'CUSTOM';
      this.controller.selectedInitiators.push(memWithPic1);
      this.controller.selectedInitiators.push(memWithPic2);
      this.controller.savePagingGroup();
      this.$timeout.flush();
      expect(this.Notification.success).toHaveBeenCalledWith('pagingGroup.successSave', { pagingGroupName: pgWithMembersAndInitiators.name });
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should save with failure', function () {
      this.savePagingGroupDefer.reject(saveFailureResp);
      this.controller.name = pg.name;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.savePagingGroup();
      this.$timeout.flush();
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorSave', { message: 'A group with this name already exists.' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });

    it('should save with failure no error', function () {
      this.savePagingGroupDefer.reject();
      this.controller.name = pg.name;
      const numberData = {
        extension: pg.extension,
        extensionUUID: pg.extensionUUID,
      };
      this.controller.number = numberData;
      this.controller.savePagingGroup();
      this.$timeout.flush();
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorSave', { message: '' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });
  });

  describe('cancelModal', () => {
    beforeEach(initComponent);

    it('should call the modal', function () {
      this.controller.cancelModal();
      expect(this.$modal.open).toHaveBeenCalledWith({
        template: require('modules/call/features/paging-group/paging-group-setup-assistant/paging-group-cancel-modal.html'),
        type: 'dialog',
      });
    });
  });
});
