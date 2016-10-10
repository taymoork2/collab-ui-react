describe('component: speedDial', () => {
  const DROPDOWN_LIST = 'button[cs-dropdown-toggle]';
  const DROPDOWN_LIST_ADD = '.actions-services li:nth-child(1) a';
  const DROPDOWN_LIST_REORDER = '.actions-services li:nth-child(2) a';
  const INPUT_NAME = 'input[name="label0"]';
  const INPUT_NUMBER = 'input[name="number0"]';
  const SAVE_BUTTON = 'button.btn--primary';
  const READ_ONLY = '.sd-readonly-wrapper .sd-label';
  const REORDER = '.sd-reorder';
  beforeEach(function() {
    this.initModules('huron.speed-dial');
    this.injectDependencies('$scope', '$timeout', 'SpeedDialService', '$q');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    spyOn(this.SpeedDialService, 'updateSpeedDials').and.returnValue(this.$q.when(true));
    spyOn(this.SpeedDialService, 'getSpeedDials').and.returnValue(this.$q.when({
      speedDials: [],
    }));
    this.compileComponent('ucSpeedDial', {
      ownerName: 'places',
      ownerId: '12345',
    });
  });

  it('should have speed dial add functionality', function() {
    this.view.find(DROPDOWN_LIST).click();
    this.view.find(DROPDOWN_LIST_ADD).click();
    expect(this.view.find(INPUT_NAME)).toExist();
    expect(this.view.find(SAVE_BUTTON)).toBeDisabled();
    this.view.find(INPUT_NAME).val('Paul').change();
    this.view.find(INPUT_NUMBER).val('1232345234').change();
    expect(this.view.find(SAVE_BUTTON)).not.toBeDisabled();
    this.view.find(SAVE_BUTTON).click();
    expect(this.view.find(READ_ONLY).get(0)).toHaveText('Paul');
  });

  it('should have speed dial reorder functionality', function() {
    this.view.find(DROPDOWN_LIST).click();
    this.view.find(DROPDOWN_LIST_ADD).click();
    this.view.find(INPUT_NAME).val('Paul').change();
    this.view.find(INPUT_NUMBER).val('1232345234').change();
    this.view.find(SAVE_BUTTON).click();
    expect(this.view.find(REORDER).get(0)).not.toExist();
    this.view.find(DROPDOWN_LIST).click();
    this.view.find(DROPDOWN_LIST_REORDER).click();
    expect(this.view.find(REORDER).get(0)).toExist();
  });

});
