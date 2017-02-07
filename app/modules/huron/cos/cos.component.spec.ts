import ClassOfServiceComponent from './index';

describe('Component: classOfService', () => {
  const restrictions = getJSONFixture('huron/json/cos/customerCos.json');

  beforeEach(function() {
    this.initModules(ClassOfServiceComponent);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.compileComponent('ucCosForm', {
      inputModel: 'restrictions',
      onChangeFn: 'onChangeFn(restrictions)',
    });

  });

  function initComponent() {
    this.$scope.restrictions = _.cloneDeep(restrictions);
    this.$scope.$apply();
  }

  describe('Class of Service for customers', () => {
    beforeEach(initComponent);

    it('should display each cos restriction', function() {
      expect(this.view.find('#' + restrictions[0].restriction + '-toggle')).toExist();
      expect(this.view.find('#' + restrictions[1].restriction + '-toggle')).toExist();
      expect(this.view.find('#' + restrictions[2].restriction + '-toggle')).toExist();
      expect(this.view.find('#' + restrictions[3].restriction + '-toggle')).toExist();
    });

    it('should change COS and call change fn', function() {
      this.view.find('#' + restrictions[0].restriction + '-toggle').click().trigger('click');
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
    });
  });
});
