describe('Component: callPickupSetupAssistant', () => {

  beforeEach(function () {
    this.initModules('huron.call-pickup.setup-assistant');
    this.injectDependencies(
      '$timeout',
      '$modal',
      '$translate',
    );
  });

  function initComponent() {
    this.compileComponent('callPickupSetupAssistant', {});
  }

  describe('lastIndex', () => {
    beforeEach(initComponent);

    it('should return 1', function () {
      expect(this.controller.lastIndex).toEqual(1);
    });
  });

  describe('getPageIndex', () => {
    beforeEach(initComponent);

    it('should return 0', function () {
      expect(this.controller.getPageIndex()).toEqual(0);
    });
  });

  describe('previousButton', () => {
    beforeEach(initComponent);

    it('should return hidden', function () {
      this.controller.index = 0;
      expect(this.controller.previousButton()).toEqual('hidden');
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
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.animation).toEqual('slide-left');
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

    it('enter key and next button invalid should not call nextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(false);
      this.controller.evalKeyPress(13);
      expect(this.controller.nextPage).not.toHaveBeenCalled();
    });

    it('enter key and next button valid should call nextPage', function () {
      spyOn(this.controller, 'nextPage');
      spyOn(this.controller, 'nextButton').and.returnValue(true);
      this.controller.evalKeyPress(13);
      expect(this.controller.nextPage).toHaveBeenCalled();
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

  describe('cancelModal', () => {
    beforeEach(initComponent);

    it('should call the modal', function () {
      spyOn(this.$modal, 'open');
      this.controller.cancelModal();
      expect(this.$modal.open).toHaveBeenCalledWith({
        templateUrl: 'modules/huron/features/callPickup/callPickupSetupAssistant/callPickupCancelModal.html',
        type: 'dialog',
      });
    });
  });
});
