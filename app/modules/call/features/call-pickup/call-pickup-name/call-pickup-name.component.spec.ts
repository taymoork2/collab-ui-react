import callPickupNameModule from './index';
import { KeyCodes } from 'modules/core/accessibility';

describe('Component: callPickupName', () => {
  const NAME_INPUT = 'input#nameInput';
  const pickupList = getJSONFixture('huron/json/features/callPickup/pickupList.json');
  beforeEach(function () {
    this.initModules(callPickupNameModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'CallPickupGroupService',
    );
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.ucKeyup = jasmine.createSpy('ucKeyup');
    this.$scope.ucKeypress = jasmine.createSpy('ucKeypress');
    this.getListOfPickupGroups = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getListOfPickupGroups').and.returnValue(this.getListOfPickupGroups.promise);
  });

  function initComponent() {
    this.compileComponent('ucCallPickupName', {
      onUpdate: 'onUpdate(name, isValid)',
      callPickupName: 'callPickupName',
      isNew: 'isNew',
      ucKeyup: 'ucKeyup($event)',
      ucKeypress: 'ucKeypress($event)',
    });
    this.$scope.isNew = true;
    this.$scope.callPickupName = '';
    this.$scope.$apply();
  }

  describe('keyboard Test', () => {
    beforeEach(initComponent);

    it('should call ucKeyup on keyup', function () {
      const event = { which: KeyCodes.ENTER };
      this.controller.keyup(event);
      expect(this.$scope.ucKeyup).toHaveBeenCalledWith(event);
    });

    it('should call ucKeypress on keypress', function () {
      const event = { which: KeyCodes.ENTER };
      this.controller.keypress(event);
      expect(this.$scope.ucKeypress).toHaveBeenCalledWith(event);
    });
  });

  describe('unique name', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      this.getListOfPickupGroups.resolve(pickupList);
    });

    it('should return true if call pickup name is unique', function() {
      this.controller.uniquePickupName('abcd<>').then(function (unique) {
        expect(unique).toEqual(true);
      });
      this.$scope.$digest();
    });

    it('should return false if callpickup name already exists', function() {
      this.controller.uniquePickupName('Blue').then(function (unique) {
        expect(unique).toEqual(false);
      });
      this.$scope.$digest();
    });
  });

  describe('update name', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      spyOn(this.controller, 'uniquePickupName').and.callThrough();
      this.getListOfPickupGroups.resolve(pickupList);
      this.$scope.$digest();
    });

    it('should not update name if regex doesn\'t match', function() {
      this.view.find(NAME_INPUT).val('blue<>').change();
      expect(this.controller.uniquePickupName).toHaveBeenCalled();
      expect(this.$scope.onUpdate).toHaveBeenCalledWith('blue<>', false);
    });

    it('should update name if name is unique and regex matches', function() {
      this.view.find(NAME_INPUT).val('sparkcall').change();
      expect(this.controller.uniquePickupName).toHaveBeenCalled();
      expect(this.$scope.onUpdate).toHaveBeenCalledWith('sparkcall', true);
    });

    it('should not update name if name is not unique', function() {
      this.view.find(NAME_INPUT).val('blue').change();
      expect(this.controller.uniquePickupName).toHaveBeenCalled();
      expect(this.$scope.onUpdate).toHaveBeenCalledWith('blue', false);
    });
  });
});
