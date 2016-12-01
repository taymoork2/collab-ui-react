describe('Component: callPickupSetupAssistant', () => {

  let member = getJSONFixture('huron/json/features/callPickup/member.json');
  let members = [member];
  let pickup = getJSONFixture('huron/json/features/callPickup/pickup.json');
  let saveFailureResp = getJSONFixture('huron/json/features/callPickup/errorResponse.json');
  let saveNumbers = ['a0a2ee69-82f4-43d1-8d1d-c0d47c65a975', 'a0a2ee69-82f4-43d1-8d1d-c0d47c65a976'];
  beforeEach(function () {
    this.initModules('huron.call-pickup.setup-assistant');
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
    );
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');

    spyOn(this.$state, 'go');

    this.saveCallPickupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'saveCallPickupGroup').and.returnValue(this.saveCallPickupDefer.promise);

    this.listCallPickupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getListOfPickupGroups').and.returnValue(this.listCallPickupDefer.promise);

    this.$timeout.flush();
  });

  function initComponent() {
    this.compileComponent('callPickupSetupAssistant', {});
  }

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

    it('should add class saveCallPickup on last page', function () {
      let arrowButton = 'button.btn--circle.btn--primary.btn--right';
      spyOn(this.controller, 'getLastIndex').and.returnValue(1);
      this.controller.index = 0;
      this.controller.nextPage();
      expect(this.controller.index).toEqual(1);
      expect(this.view.find(arrowButton)).toHaveClass('saveCallPickup');
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
      this.controller.onUpdateName('name', true, true);
      expect(this.controller.name).toEqual('name');
      expect(this.controller.isNameValid).toBeTruthy();
    });
  });

  describe('onUpdateMember', () => {
    beforeEach(initComponent);

    it('should update members and isMemberValid', function() {
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
      this.controller.enterNextPage(13);
      expect(this.controller.nextPage).toHaveBeenCalled();
    });
  });

  describe('cancelModal', () => {
    beforeEach(initComponent);

    it('should call the modal', function () {
      spyOn(this.$modal, 'open');
      this.controller.cancelModal();
      expect(this.$modal.open).toHaveBeenCalledWith({
        templateUrl: 'modules/huron/features/callPickup/callPickupCancelModal.html',
        type: 'dialog',
      });
    });
  });

  describe('saveCallPickupGroup', () => {
    beforeEach(initComponent);

    it('should save uuid for all numbers in save numbers', function() {
      this.controller.selectedMembers = member;
      this.controller.saveCallPickup();
      this.$timeout.flush();
      expect(this.controller.saveNumbers[0]).toEqual(saveNumbers[0]);
    });

    it('should call successSave when callpickup is saved', function() {
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
});
