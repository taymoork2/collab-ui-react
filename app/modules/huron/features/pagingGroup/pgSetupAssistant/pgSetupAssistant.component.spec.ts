import { INumber } from '../pgNumber.service';
import { IPagingGroup } from '../pagingGroup';

describe('Component: pgSetupAssistant', () => {

  beforeEach(function () {
    this.initModules('huron.paging-group.setup-assistant');
    this.injectDependencies(
      '$timeout',
      '$modal',
      '$state',
      '$translate',
      'PagingGroupService'
    );
  });

  function initComponent() {
    this.compileComponent('pgSetupAssistant', {});
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

    it('index = 1, number undefined should return false', function () {
      this.controller.index = 1;
      this.controller.number = undefined;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, number defined, isValid undefined should return false', function () {
      this.controller.index = 1;
      this.controller.number = {};
      this.controller.isNumberValid = undefined;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, number defined, isValid false should return false', function () {
      this.controller.index = 1;
      this.controller.number = {};
      this.controller.isNumberValid = false;
      expect(this.controller.nextButton()).toBeFalsy();
    });

    it('index = 1, number defined, isValid true should return true', function () {
      this.controller.index = 1;
      this.controller.number = {};
      this.controller.isNumberValid = true;
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

    it('last index should call save', function () {
      spyOn(this.controller, 'savePagingGroup');
      this.controller.index = this.controller.lastIndex;
      this.controller.nextPage();
      this.$timeout.flush();
      this.$timeout.verifyNoPendingTasks();
      expect(this.controller.animation).toEqual('slide-left');
      expect(this.controller.index).toEqual(2);
      expect(this.controller.savePagingGroup).toHaveBeenCalled();
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

    it('should change name and isNameValid', function () {
      let number: INumber = <INumber> {
        uuid: '1',
        number: '5000',
      };
      this.controller.onUpdateNumber(number, true);
      expect(this.controller.number).toEqual(number);
      expect(this.controller.isNumberValid).toBeTruthy();
    });
  });

  describe('savePagingGroup', () => {
    beforeEach(initComponent);

    it('should change name and isNameValid', function () {
      spyOn(this.PagingGroupService, 'savePagingGroup');
      spyOn(this.$state, 'go');
      let name: string = 'name';
      let number: INumber = <INumber> {
        uuid: '1',
        number: '5000',
      };
      let pg: IPagingGroup = <IPagingGroup>{
        name: name,
        number: number,
        uuid: name, //TODO will hookup with real uuid when backend is ready
      };
      this.controller.name = name;
      this.controller.number = number;
      this.controller.savePagingGroup();

      expect(this.PagingGroupService.savePagingGroup).toHaveBeenCalledWith(pg);
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });
  });

  describe('cancelModal', () => {
    beforeEach(initComponent);

    it('should call the modal', function () {
      spyOn(this.$modal, 'open');
      this.controller.cancelModal();
      expect(this.$modal.open).toHaveBeenCalledWith({
        templateUrl: 'modules/huron/features/pagingGroup/pgSetupAssistant/pgCancelModal.tpl.html',
        type: 'dialog',
      });
    });
  });
});
