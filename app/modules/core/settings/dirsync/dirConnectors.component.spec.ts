import testModule from './dirConnectors.component';

describe('DirConnectors Component', () => {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope');

    this.initComponent = (bindings) => {
      this.compileComponent('dirConnectorsConfig', _.assignIn({
      }, bindings));
      this.controller.$onInit();
    };

    this.$scope.handleDeregister = (connector) => {
      _.noop(connector);
    };
    spyOn(this.$scope, 'handleDeregister').and.callThrough();

    this.$scope.testConnectors = [
      { name: 'Connector 1', isInService: false },
      { name: 'Connector 2', isInService: true },
    ];

    this.initComponent({
      connectors: 'testConnectors',
      onDeregister: 'handleDeregister()',
    });

  });

  /////////////////////////

  it('should handle bindings', function () {
    expect(this.controller.connectors[1]).toEqual(jasmine.objectContaining(this.$scope.testConnectors[1]));
    expect(this.controller.onDeregister).toBeDefined();
  });

  it('should execute callback deregister', function () {
    this.controller.deregister(this.$scope.testConnectors[0]);
    expect(this.$scope.handleDeregister).toHaveBeenCalled();
  });

  it('should reflect changes to component data', function () {
    spyOn(this.controller, '$onChanges').and.callThrough();

    expect(this.controller.connectors[1]).toEqual(jasmine.objectContaining(this.$scope.testConnectors[1]));
    this.$scope.testConnectors.push({ name: 'Connector 3', isInService: true });
    expect(this.controller.connectors).toHaveLength(2);

    const changesObject = {
      connectors: {
        previousValue: this.controller.connectors,
        currentValue: this.$scope.testConnectors,
        isFirstChange() { return false; },
      },
    };
    this.controller.$onChanges(changesObject);
    expect(this.controller.$onChanges).toHaveBeenCalled();
    expect(this.controller.connectors).toHaveLength(3);
  });

});
