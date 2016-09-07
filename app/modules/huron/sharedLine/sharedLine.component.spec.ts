import sharedLineModule from './index';
import { SharedLineUser, User, SharedLineDevice } from './index';


describe('Component: sharedLine', () => {
  const SHAREDLINE_LABEL = 'label[for="sharedLine"]';
  const SHAREDLINE_INPUT = 'input#userInput';
  const SHAREDLINE_DIV = 'div.shared-line';
  const TYPEAHEAD_DROPDOWN = '.shared-line .typeahead-dropdown';
  const TYPEAHEAD_SELECT = '.shared-line .typeahead-dropdown ul li';
  const TYPEAHEAD_INPUT = '.typeahead-dropdown input';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const ACCORDION_LIST = '.accordion ul li';
  const ACCORDION = '.shared-line .accordion a';
  const REMOVE_LINK = 'a#removeMemberLink';

  beforeEach(function () {
    this.initModules(sharedLineModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$q'
    );

    this.$scope.getUserList= jasmine.createSpy('getUserList').and.returnValue(this.$q.when([]));
    this.$scope.selectSharedLineUserFn = jasmine.createSpy('selectSharedLineUserFn');
    this.$scope.isSingleDeviceFn = jasmine.createSpy('isSingleDeviceFn');
    this.$scope.disassociateSharedLineUserFn = jasmine.createSpy('disassociateSharedLineUserFn');
  });

  function initComponent() {
    this.compileComponent('ucSharedLine', {
      selectedUser: 'selectedUser',
      sharedLineUsers: 'sharedLineUsers',
      sharedLineEndpoints: 'sharedLineEndpoints',
      oneAtATime: 'oneAtATime',
      selectSharedLineUserFn: 'selectSharedLineUserFn(user)',
      getUserListFn: 'getUserList(filter)',
      isSingleDeviceFn: 'isSingleDeviceFn(uuid)',
      disassociateSharedLineUserFn: 'disassociateSharedLineUserFn(user,false)'
    });
    this.$scope.sharedLineUsers = getJSONFixture('huron/json/sharedLine/sharedUsers.json');
    this.$scope.sharedLineEndpoints = getJSONFixture('huron/json/sharedLine/sharedDevices.json');
    this.$scope.selectedUser = this.$scope.sharedLineUsers[0];
    this.$scope.$apply();
  }

  describe('should show Shared line elements', () => {
    beforeEach(initComponent);

    it('should have sharedline input', function () {
      expect(this.view).toContainElement(SHAREDLINE_INPUT);
    });

    it('should have sharedline div element', function () {
      expect(this.view).toContainElement(SHAREDLINE_DIV);
    });
  });

  describe('check typeahead input element for sharedline user', () => {
    beforeEach(initComponent);

    it('should have sharedline typeahead input element', function () {
      expect(this.view).toContainElement(SHAREDLINE_INPUT);
    });

    it('Should have sharedline div element', function () {
      expect(this.view).toContainElement(SHAREDLINE_DIV);
    });

    it('should have sharedline typeahead input', function () {
      var elem = this.view.find(TYPEAHEAD_DROPDOWN);
      this.view.find(TYPEAHEAD_INPUT).val('a').change();
      this.$timeout.flush();
      expect(this.$scope.getUserList).toHaveBeenCalledWith('a');

    });
  });

  describe('Check sharedline user accordions', () => {
    beforeEach(initComponent);

    it('Should get all the sharedline users', function () {
      expect(this.$scope.sharedLineUsers).toHaveLength(2);
      expect(this.view.find(ACCORDION_LIST).get(0)).toHaveText('Peter@yahoo.com');
    });

    it('should list accordion sharedline device for a user', function () {
      this.view.find(ACCORDION).get(0).click();
      expect(this.$scope.isSingleDeviceFn).toHaveBeenCalled();
      expect(this.view.find('cs-checkbox label').get(0)).toHaveText('DX650');
    });

    it('should invoke to delete sharedline user', function () {
      this.view.find(ACCORDION).get(0).click();
      this.view.find(REMOVE_LINK).click();
      expect(this.$scope.disassociateSharedLineUserFn).toHaveBeenCalled();
    });
  });

});
