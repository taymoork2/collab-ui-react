describe('component: callerId', () => {
  const CALLERID_SELECT = '.csSelect-container[name="callerIdSelection"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const CALLERIDNAME_INPUT = 'input[name="callerIdName"]';
  const CALLERIDNUMBER_INPUT = 'input[name="callerIdNumber"]';

  beforeEach(function() {
    this.initModules('huron.caller-id');
    this.injectDependencies('$scope', '$timeout');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.callerIdOptions = [{
      label: 'Custom',
      value: {
        name: 'Custom'
      }
    }, {
      label: 'Blocked Outbound Caller ID',
      value: {
        name: 'blockedCallerIdDescription'
      }
    }]
    this.compileComponent('callerId', {
      callerIdOptions: 'callerIdOptions',
      callerIdSelected: 'callerIdSelected',
      customCallerIdName: 'customCallerIdName',
      customCallerIdNumber: 'customCallerIdNumber',
      onChangeFn: 'onChangeFn(callerIdSelected, customCallerIdName, customCallerIdNumber)'
    });
  });

  it('should have caller id selection with options', function() {
    expect(this.view.find(CALLERID_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('Custom');
    expect(this.view.find(CALLERID_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('Blocked Outbound Caller ID');
    expect(this.view.find(CALLERIDNAME_INPUT)).not.toExist();
  });
    
  it('should invoke onChangeFn with internalNumber on option click', function () {
    this.view.find(CALLERID_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
      this.$scope.callerIdOptions[0],
      undefined,
      undefined
    );
    this.$timeout.flush(); // for cs-select
    expect(this.view.find(CALLERIDNAME_INPUT)).toExist();
    this.view.find(CALLERIDNAME_INPUT).val('Field').change().blur();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
      this.$scope.callerIdOptions[0],
      'Field',
      undefined
    );
    this.view.find(CALLERIDNUMBER_INPUT).val('8179325799').change().blur();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
      this.$scope.callerIdOptions[0],
      'Field',
      '8179325799'
    );
  });
});