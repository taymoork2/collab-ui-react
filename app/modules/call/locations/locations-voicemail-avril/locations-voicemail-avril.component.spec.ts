import locationVoicemailAvrilModule from './index';
import { IOption } from 'modules/huron/dialing';

const options: IOption[] = [
  {
    label: '(409) 123-4567',
    value: '+14091234567',
  },
  {
    label: '(409) 123-4568',
    value: '+14091234568',
  },
  {
    label: '(409) 123-4569',
    value: '+14091234569',
  },
];


describe('Component: LocationsVoicemailAvrilComponent', () => {
  beforeEach(function() {
    this.initModules(locationVoicemailAvrilModule);
    this.injectDependencies(
      '$scope',
      '$translate',
    );
    this.$scope.externalAccess = false;
    this.$scope.externalNumber = '';
    this.$scope.externalNumberOptions = [];
    this.$scope.changeFn = jasmine.createSpy('changeFn');
    this.$scope.numberFilterFn = jasmine.createSpy('numberFilterFn');
  });

  function initComponent() {
    this.compileComponent('ucLocationVoicemailAvril', {
      externalAccess: 'externalAccess',
      externalNumber: 'externalNumber',
      externalNumberOptions: 'externalNumberOptions',
      changeFn: 'changeFn(externalAccess, externalNumber)',
      numberFilterFn: 'numberFilterFn(filter)',
    });
  }

  describe('default values,', function () {
    beforeEach(initComponent);
    it('should create controller', function () {
      expect(this.controller).toExist();
    });
    it('should show warning due to no options', function () {
      expect(this.controller.missingDirectNumbers).toEqual(true);
    });
    it('should have externalNumberModel equal to null', function () {
      expect(this.controller.externalNumberModel).toEqual(null);
    });
  });

  describe('option values set,', function () {
    beforeEach(function () {
      this.$scope.externalNumberOptions = options;
      this.$scope.externalNumber = '+14091234568';
    });
    beforeEach(initComponent);

    it('should have externalNumberModel equal to 2nd item in options array', function () {
      expect(this.controller.externalNumberModel).toEqual(options[1]);
    });
    it('should call changeFn with correct parameters', function () {
      this.controller.externalAccess = true;
      this.controller.onChange();
      expect(this.$scope.changeFn).toHaveBeenCalledWith(
        this.controller.externalAccess,
        this.controller.externalNumberModel.value,
      );
    });
    it('should reset externalNumberModel back to null', function () {
      this.controller.externalAccess = false;
      this.controller.onChange();
      expect(this.controller.externalNumberModel).toEqual(null);
    });
    it('should call numberFilterFn', function () {
      this.controller.onNumberFilter('9');
      expect(this.$scope.numberFilterFn).toHaveBeenCalled();
    });
  });

});
