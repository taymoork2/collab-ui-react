describe('Component: callPickupName', () => {
  const NAME_INPUT = 'input#nameInput';
  let pickupList = getJSONFixture('huron/json/features/callPickup/pickupList.json');
  beforeEach(function () {
    this.initModules('huron.call-pickup.name');
    this.injectDependencies(
      '$scope',
      '$q',
      'CallPickupGroupService',
    );
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.getListOfPickupGroups = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getListOfPickupGroups').and.returnValue(this.getListOfPickupGroups.promise);
  });

  function initComponent() {
    this.compileComponent('callPickupName', {
      onUpdate: 'onUpdate(name, isValid)',
      callPickupName: 'callPickupName',
      isNew: 'isNew',
    });
    this.$scope.isNew = true;
    this.$scope.callPickupName = '';
    this.$scope.$apply();
  }

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
