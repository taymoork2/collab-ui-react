import extensionLengthModule from './index';

describe('Component: extensionLength', () => {
  const EXTENSION_LENGTH_SELECT = '.csSelect-container[name="extensionLength"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const SELECT_TOGGLE = '.select-toggle';
  const EXTENSION_LENGTH_FOUR = 4;
  const EXTENSION_LENGTH_SIX = 6;

  beforeEach(function() {
    this.initModules(extensionLengthModule);
    this.injectDependencies(
      '$scope',
      'Authinfo',
      '$httpBackend',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);
  });

  function initComponent() {
    this.compileComponent('ucExtensionLength', {
      firstTimeSetup: 'firstTimeSetup',
      extensionLength: 'extensionLength',
      settingsData: 'settingsData',
      extensionDecreaseAllowed: 'extensionDecreaseAllowed',
      extensionLengthSavedFn: 'extensionLengthSavedFn()',
      onChangeFn: 'onChangeFn(extensionLength)',
    });
  }

  describe('firstTimeSetup = true', () => {
    beforeEach(function() {
      this.$scope.firstTimeSetup = true;
      this.$scope.extensionLength = EXTENSION_LENGTH_FOUR;
      this.$scope.extensionDecreaseAllowed = true;
      this.$scope.$apply();
    });
    beforeEach(initComponent);

    it('should have a select box with options', function() {
      expect(this.view).toContainElement(EXTENSION_LENGTH_SELECT);
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('3');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('4');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('5');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('6');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(4)).toHaveText('7');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(5)).toHaveText('8');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(6)).toHaveText('9');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(7)).toHaveText('10');
    });

    it('should not be disabled when firstTimeSetup = true', function() {
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(SELECT_TOGGLE)).not.toHaveClass('disabled');
    });
  });

  describe('firstTimeSetup = false and extensionsAssigned = true', () => {
    beforeEach(function() {
      this.$scope.firstTimeSetup = false;
      this.$scope.extensionDecreaseAllowed = false;
      this.$scope.extensionLength = EXTENSION_LENGTH_SIX;
      this.$scope.$apply();
    });
    beforeEach(initComponent);

    it('should have a select box with only options 6 thru 10', function() {
      expect(this.view).toContainElement(EXTENSION_LENGTH_SELECT);
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('6');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('7');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('8');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('9');
      expect(this.view.find(EXTENSION_LENGTH_SELECT).find(DROPDOWN_OPTIONS).get(4)).toHaveText('10');
    });

  });

});
