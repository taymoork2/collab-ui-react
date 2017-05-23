describe ('component: ucHuntGroupCallsToSparkApp', () => {
  const TOGGLE_CALLS_TO_SPARK_APP = '.toggle-switch #hgCallsToSparkAppToggle';

  beforeEach(function() {
    this.initModules('huron.hunt-group-calls-to-spark-app');
    this.injectDependencies('$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucHuntGroupCallsToSparkApp', {
      callsToSparkApp: true,
      onChangeFn: 'onChangeFn()',
    });
  });

  it(' should have the hunt group calls to spark app toggle ', function () {
    expect(this.view.find(TOGGLE_CALLS_TO_SPARK_APP)).toExist();
    expect(this.view.find(TOGGLE_CALLS_TO_SPARK_APP)).toBeChecked();
    this.view.find(TOGGLE_CALLS_TO_SPARK_APP).click();
    expect(this.view.find(TOGGLE_CALLS_TO_SPARK_APP)).not.toBeChecked();
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });
});
