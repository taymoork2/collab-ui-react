describe('component: callerId', () => {
  const CALLERID_SELECT = '.csSelect-container[name="callerIdSelection"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const CALLERIDNAME_INPUT = 'input[name="callerIdName"]';
  const CALLERIDNUMBER_INPUT = 'phone-number input';

  beforeEach(function() {
    this.initModules('huron.caller-id');
    this.injectDependencies('$scope', '$timeout', '$q', 'CallerIDService');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.myForm = {
      $dirty: true,
    };
    this.callDestInputs = ['external'];
    this.$scope.callerIdOptions = [{
      label: 'Custom',
      value: 'EXT_CALLER_ID_CUSTOM',
    }, {
      label: 'Blocked Outbound Caller ID',
      value: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
    }];
    this.$scope.companyNumbers = [];
    this.$scope.callerIdSelected = 'EXT_CALLER_ID_BLOCKED_CALLER_ID';
    this.compileComponent('ucCallerId', {
      callerIdOptions: 'callerIdOptions',
      callerIdSelected: 'callerIdSelected',
      customCallerIdName: 'customCallerIdName',
      customCallerIdNumber: 'customCallerIdNumber',
      onChangeFn: 'onChangeFn(callerIdSelected, customCallerIdName, customCallerIdNumber)',
      companyNumbers: 'companyNumbers',
    });
  });

  it('should have caller id selection with options', function() {
    expect(this.view.find(CALLERID_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('Custom');
    expect(this.view.find(CALLERID_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('Blocked Outbound Caller ID');
    expect(this.view.find(CALLERIDNAME_INPUT)).not.toExist();
  });

  it('should invoke onChangeFn with external on option click', function () {
    this.view.find(CALLERID_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
      this.$scope.callerIdOptions[0],
      undefined,
      undefined,
    );
    this.$timeout.flush(); // for cs-select
    expect(this.view.find(CALLERIDNAME_INPUT)).toExist();
    this.view.find(CALLERIDNAME_INPUT).val('Field').change().blur();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(
      this.$scope.callerIdOptions[0],
      'Field',
      undefined,
    );
    this.view.find(CALLERIDNUMBER_INPUT).val('+1 214-932-5799').change().blur();
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('showCustom returns whether its a custom or not', function() {
    this.controller.callerIdSelected = {
      label: 'Custom',
    };
    expect(this.controller.showCustom()).toBe(true);
    this.controller.callerIdSelected = {
      label: 'Blocked Outbound Caller ID',
    };
    expect(this.controller.showCustom()).toBe(false);
  });
});
