import sharedLineModule from './index';
import { SharedLine, SharedLinePlace, SharedLineUser, SharedLinePhone } from './index';

describe('Component: sharedLine', () => {
  const SHAREDLINE_INPUT = 'input#userInput';
  const SHAREDLINE_DIV = 'div.shared-line';
  const TYPEAHEAD_INPUT = '.typeahead-dropdown input';
  const ACCORDION_LIST = '.accordion ul li';
  const ACCORDION = '.shared-line .accordion a';
  const REMOVE_LINK = 'a#removeMemberLink';

  beforeEach(function () {
    this.initModules(sharedLineModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$q',
    );

    this.$scope.getUserList = jasmine.createSpy('getUserList').and.returnValue(this.$q.when([]));
    this.$scope.onSharedLineChangeFn = jasmine.createSpy('onSharedLineChangeFn');
    this.$scope.onDeleteSharedLineMemberFn = jasmine.createSpy('onDeleteSharedLineMemberFn');
  });

  function initComponent() {
    this.compileComponent('ucSharedLine', {
      sharedLines: 'sharedLines',
      newSharedLineMembers: 'newSharedLineMembers',
      oneAtATime: 'oneAtATime',
      selectSharedLineUserFn: 'selectSharedLineUserFn(user)',
      getUserListFn: 'getUserList(filter)',
      onSharedLineChangeFn: 'isSingleDeviceFn()',
      onDeleteSharedLineMemberFn: 'onDeleteSharedLineMemberFn(sharedLineMember)',
    });

    this.$scope.sharedLines = [
      new SharedLine({
        uuid: '0001',
        primary: false,
        place: new SharedLinePlace({
          uuid: '0002',
          displayName: 'Scary Place',
        }),
        user: new SharedLineUser({
          uuid: null,
          firstName: null,
          lastName: null,
          userName: null,
        }),
        phones: [
          new SharedLinePhone({
            uuid: '0005',
            description: 'Scary Place (Cisco 8845)',
            assigned: true,
          }),
          new SharedLinePhone({
            uuid: '0006',
            description: 'Scary Place (Cisco 8865)',
            assigned: false,
          }),
        ],
      }),
      new SharedLine({
        uuid: '0003',
        primary: true,
        place: new SharedLinePlace({
          uuid: null,
          displayName: null,
        }),
        user: new SharedLineUser({
          uuid: '0004',
          firstName: 'Scary',
          lastName: 'User',
          userName: 'scary.user@haunted.com',
        }),
        phones: [],
      }),
      new SharedLine({
        uuid: '0006',
        primary: true,
        place: new SharedLinePlace({
          uuid: null,
          displayName: null,
        }),
        user: new SharedLineUser({
          uuid: '0007',
          firstName: null,
          lastName: null,
          userName: 'super.scary.user@haunted.com',
        }),
        phones: [],
      }),
      new SharedLine({
        uuid: '0008',
        primary: true,
        place: new SharedLinePlace({
          uuid: null,
          displayName: null,
        }),
        user: new SharedLineUser({
          uuid: '0009',
          firstName: '',
          lastName: null,
          userName: 'invisible.user@haunted.com',
        }),
        phones: [],
      }),
    ];
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
      this.view.find(TYPEAHEAD_INPUT).val('a').change();
      this.$timeout.flush();
      expect(this.$scope.getUserList).toHaveBeenCalledWith('a');
    });
  });

  describe('Check sharedline user accordions', () => {
    beforeEach(initComponent);

    it('Should get all the sharedline users', function () {
      expect(this.$scope.sharedLines).toHaveLength(4);
      expect(this.view.find(ACCORDION_LIST).get(0)).toHaveText('Scary Place');
      expect(this.view.find(ACCORDION_LIST).get(1)).toHaveText('Scary User');
      expect(this.view.find(ACCORDION_LIST).get(2)).toHaveText('super.scary.user@haunted.com');
      expect(this.view.find(ACCORDION_LIST).get(3)).toHaveText('invisible.user@haunted.com');
    });

    it('should list accordion sharedline phones for a user', function () {
      this.view.find(ACCORDION).get(0).click();
      expect(this.view.find('cs-checkbox label')).toHaveLength(2);
      expect(this.view.find('cs-checkbox label').get(0)).toHaveText('Scary Place (Cisco 8845)');
    });

    it('should invoke to delete sharedline user', function () {
      this.view.find(ACCORDION).get(0).click();
      expect(this.view.find(REMOVE_LINK)).toExist();
      this.view.find(REMOVE_LINK).click();
      expect(this.$scope.onDeleteSharedLineMemberFn).toHaveBeenCalled();
    });
  });

});
