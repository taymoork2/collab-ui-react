import callPickupModule from './index';
import { KeyCodes } from 'modules/core/accessibility/accessibility.service';

describe('Component: callPickup', () => {

  const member = getJSONFixture('huron/json/features/callPickup/member.json');
  const members = [member];
  const updateCallPickup = getJSONFixture('huron/json/features/callPickup/callPickup.json');
  const callpickupgroup = getJSONFixture('huron/json/features/callPickup/callPickupGroup.json');
  const pickup = getJSONFixture('huron/json/features/callPickup/pickup.json');
  const saveFailureResp = getJSONFixture('huron/json/features/callPickup/errorResponse.json');
  const updateFailureResp = getJSONFixture('huron/json/features/callPickup/errorResponse.json');
  const saveNumbers = ['a0a2ee69-82f4-43d1-8d1d-c0d47c65a975', 'a0a2ee69-82f4-43d1-8d1d-c0d47c65a976'];
  beforeEach(function () {
    this.initModules(callPickupModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$modal',
      '$state',
      '$translate',
      '$q',
      '$scope',
      'Notification',
      'CallPickupGroupService',
      'FeatureMemberService',
    );
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.$state, 'go');

    this.saveCallPickupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'saveCallPickupGroup').and.returnValue(this.saveCallPickupDefer.promise);

    this.updateCallPickupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'updateCallPickup').and.returnValue(this.updateCallPickupDefer.promise);

    this.listCallPickupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getListOfPickupGroups').and.returnValue(this.listCallPickupDefer.promise);

    this.getMemberPictureDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberPicture').and.returnValue(this.getMemberPictureDefer.promise);

    this.getCallPickupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getCallPickupGroup').and.returnValue(this.getCallPickupDefer.promise);
    this.getCallPickupDefer.resolve(callpickupgroup);

    this.getNumbersDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getMemberNumbers').and.returnValue(this.getNumbersDefer.promise);
    this.$timeout.flush();
  });

  function initComponent() {
    this.compileComponent('ucCallPickup', {});
  }

  describe('check for changes call pickup', () => {
    let originalName;

    beforeEach(initComponent);

    beforeEach(function () {
      originalName = this.controller.callPickup.name;
    });

    afterEach(function () {
      this.controller.callPickup.name = originalName;
    });

    it('should set form to invalid if name is empty', function () {
      this.controller.callPickup.name = '';
      this.controller.checkForChanges();
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.form.$invalid).toBeTruthy();
    });

    it('should set form to invalid if name is invalid', function () {
      this.controller.callPickup.name = '';
      this.controller.checkForChanges();
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.form.$invalid).toBeTruthy();
    });

    it('should set form to invalid if notification timer is not between 1 and 120', function () {
      this.isNotificationTimerValid = false;
      this.controller.checkForChanges();
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.form.$invalid).toBeTruthy();
    });
  });

  describe('lastIndex', () => {
    beforeEach(initComponent);

    it('should return 1', function () {
      expect(this.controller.getLastIndex()).toEqual(1);
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
      this.controller.name = 'PG 1';
      this.controller.isNameValid = undefined;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 0, name not empty, isValid false should return false', function () {
      this.controller.index = 0;
      this.controller.name = 'PG 1';
      this.controller.isNameValid = false;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 0, name not empty, isValid true should return true', function () {
      this.controller.index = 0;
      this.controller.name = 'PG 1';
      this.controller.isNameValid = true;
      expect(this.controller.nextButton()).toBeTruthy();
    });

    it('index = 1, members empty array return false', function () {
      this.controller.index = 1;
      this.controller.selectedMembers = [];
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, 2 members in array and valid member return true', function () {
      this.controller.index = 1;
      this.controller.isValidMember = true;
      this.controller.selectedMembers.push(members);
      this.controller.selectedMembers.push(members);
      expect(this.controller.nextButton()).toBeTruthy();
    });

    it('default case should return true', function () {
      this.controller.index = 2;
      expect(this.controller.nextButton()).toBeTruthy();
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
      expect(this.controller.animation).toEqual('slide-left');
    });

    it('should add class save-call-feature on last page', function () {
      const arrowButton = 'button.btn--circle.btn--primary.btn--right';
      spyOn(this.controller, 'getLastIndex').and.returnValue(1);
      this.controller.index = 0;
      this.controller.nextPage();
      expect(this.controller.index).toEqual(1);
      expect(this.view.find(arrowButton)).toHaveClass('save-call-feature');
    });

    it('should decrement index if its last page', function() {
      spyOn(this.controller, 'getLastIndex').and.returnValue(1);
      this.controller.index = 1;
      this.controller.nextPage();
      expect(this.controller.index).toEqual(1);
    });
  });

  describe('evalKeyPress', () => {
    beforeEach(initComponent);

    it('escape key should call cancelModal', function () {
      spyOn(this.controller, 'cancelModal');
      this.controller.evalKeyPress({ which: KeyCodes.ESCAPE });
      expect(this.controller.cancelModal).toHaveBeenCalled();
    });

    it('right arrow key and next button invalid should not call nextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(false);
      this.controller.evalKeyPress({ which: KeyCodes.RIGHT });
      expect(this.controller.nextPage).not.toHaveBeenCalled();
    });

    it('right arrow key and next button valid should call nextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(true);
      this.controller.evalKeyPress({ which: KeyCodes.RIGHT });
      expect(this.controller.nextPage).toHaveBeenCalled();
    });

    it('left arrow key and previous button invalid should not call previousPage', function () {
      spyOn(this.controller, 'previousPage');
      spyOn(this.controller, 'previousButton').and.returnValue(false);
      this.controller.evalKeyPress({ which: KeyCodes.LEFT });
      expect(this.controller.previousPage).not.toHaveBeenCalled();
    });

    it('left arrow key and previous button valid should call previousPage', function () {
      spyOn(this.controller, 'previousPage');
      spyOn(this.controller, 'previousButton').and.returnValue(true);
      this.controller.evalKeyPress({ which: KeyCodes.LEFT });
      expect(this.controller.previousPage).toHaveBeenCalled();
    });

    it('any key should call nothing', function () {
      spyOn(this.controller, 'previousPage');
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'cancelModal');
      this.controller.evalKeyPress({ which: 42 });
      expect(this.controller.previousPage).not.toHaveBeenCalled();
      expect(this.controller.nextPage).not.toHaveBeenCalled();
      expect(this.controller.cancelModal).not.toHaveBeenCalled();
    });
  });

  describe('setNotifications', () => {
    beforeEach(initComponent);

    it('should change notification settings', function () {
      const originalCP = this.controller.callPickup;
      this.controller.setNotifications(true, true, true);
      expect(this.controller.callPickup.playSound).toEqual(true);
      expect(this.controller.callPickup.displayCalledPartyId).toEqual(true);
      expect(this.controller.callPickup.displayCallingPartyId).toEqual(true);
      this.controller.callPickup = originalCP;
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

  describe('setCallPickupName', () => {
    beforeEach(initComponent);

    it('should change name and isNameValid', function () {
      const originalCP = this.controller.callPickup;
      this.controller.setCallPickupName('test', true);
      expect(this.controller.callPickup.name).toEqual('test');
      expect(this.controller.isNameValid).toBeTruthy();
      this.controller.callPickup = originalCP;
    });
  });

  describe('onCancel', () => {
    beforeEach(initComponent);

    it('should reset form', function () {
      spyOn(this.controller, 'resetForm');
      this.controller.onCancel();
      expect(this.controller.resetForm).toHaveBeenCalled();
    });
  });

  describe('onUpdateMember', () => {
    beforeEach(initComponent);

    it('should update members and isMemberValid', function () {
      spyOn(this.controller, 'checkForChanges').and.callFake(function () { });
      this.controller.onUpdateMember(members, true);
      expect(this.controller.selectedMembers).toEqual(members);
      expect(this.controller.isValidMember).toBeTruthy();
    });
  });

  describe('enterNextPage', () => {
    beforeEach(initComponent);

    it('should call next page is next button is true', function() {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(true);
      this.controller.enterNextPage({ which: KeyCodes.ENTER });
      expect(this.controller.nextPage).toHaveBeenCalled();
    });
  });

  describe('cancelModal', () => {
    beforeEach(initComponent);

    it('should call the modal', function () {
      spyOn(this.$modal, 'open');
      this.controller.cancelModal();
      expect(this.$modal.open).toHaveBeenCalledWith({
        template: require('modules/call/features/call-pickup/call-pickup-cancel-modal.html'),
        type: 'dialog',
      });
    });
  });

  describe('saveCallPickupGroup', () => {
    beforeEach(initComponent);

    it('should call successSave when callpickup is saved', function () {
      this.saveCallPickupDefer.resolve(pickup);
      this.controller.name = pickup.name ;
      this.controller.saveNumbers = saveNumbers;
      this.controller.saveCallPickup();
      this.$timeout.flush();
      expect(this.Notification.success).toHaveBeenCalledWith('callPickup.successSave', { callPickupName: pickup.name });
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should call error notification if save fails', function () {
      this.saveCallPickupDefer.reject(saveFailureResp);
      this.controller.name = pickup.name;
      this.controller.saveNumbers = saveNumbers;
      this.controller.saveCallPickup();
      this.$timeout.flush();
      expect(this.Notification.error).toHaveBeenCalledWith('callPickup.errorSave', { message: 'A group with this name already exists.' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });
  });

  describe('update call pickup', () => {
    beforeEach(initComponent);

    it('should call success updated when callpickup is updated', function () {
      this.updateCallPickupDefer.resolve(updateCallPickup);
      this.controller.updateCallPickup();
      this.$timeout.flush();
      expect(this.Notification.success).toHaveBeenCalledWith('callPickup.successUpdate', { callPickupName: updateCallPickup.name });
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should call error notification if save fails', function () {
      this.updateCallPickupDefer.reject(updateFailureResp);
      this.controller.updateCallPickup();
      this.$timeout.flush();
      expect(this.Notification.error).toHaveBeenCalledWith('callPickup.errorUpdate', { message: 'A group with this name already exists.' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });
  });
});
