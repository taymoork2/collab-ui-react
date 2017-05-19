import callFeatureMembersModule from './index';

describe('Component: CallFeatureMembers', () => {
  const DISPLAYED_MEMBER_COUNT = 10;
  const MEMBER_COUNT = 11;
  const CS_CARD_MEMBER = 'cs-card-member';
  const SHOW_MORE_LESS_LINK = '.members-footer a';
  const REORDER_LINK = '.members-header a';
  const CANCEL_REORDER_LINK = '.cancel-reorder';
  const APPLY_REORDER_LINK = '.apply-reorder';
  const SEARCH_ADD_INPUT = 'input#callfeaturememberadd';
  const SEARCH_MEMBER_INPUT = 'input#callfeaturemembersearch';
  const DROPDOWN_OPTIONS = '.search-add ul li';

  let typeaheadResults = getJSONFixture('huron/json/features/callFeatureMembers/typeaheadMemberResponse.json');

  beforeEach(function () {
    this.initModules(callFeatureMembersModule);
    this.injectDependencies(
      '$scope',
      '$rootScope',
      '$timeout',
      '$q',
      'MemberService',
    );
    this.typeaheadResults = typeaheadResults;
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.getMemberListDefer = this.$q.defer();
    spyOn(this.MemberService, 'getMemberList').and.returnValue(this.getMemberListDefer.promise);
  });

  function initComponent() {
    this.compileComponent('ucCallFeatureMembers', {
      members: 'members',
      filterBy: 'filterBy',
      showExternalNumbers: 'showExternalNumbers',
      isNew: false,
      memberHintKey: 'memberHintKey',
      removeKey: 'removeKey',
      dragAndDrop: 'dragAndDrop',
      memberItemType: 'memberItemType',
      onChangeFn: 'onChangeFn(members)',
    });
  }

  describe('Handle showing/hiding members when member count > 10', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.members = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
      this.$scope.$apply();
    });

    it('should display only 10 members initially', function() {
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_MEMBER_COUNT);
    });

    it('should display all 11 members when Show More is clicked', function() {
      this.view.find(SHOW_MORE_LESS_LINK).get(0).click();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(MEMBER_COUNT);
    });

    it('should display only 10 members when Show Less is clicked', function() {
      this.view.find(SHOW_MORE_LESS_LINK).get(1).click();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_MEMBER_COUNT);
    });
  });

  describe('Reorder functionality', () => {
    beforeEach(initComponent);

    describe('dragAndDrop = false', () => {
      beforeEach(function () {
        this.$scope.members = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
        this.$scope.dragAndDrop = false;
        this.$scope.$apply();
      });

      it('should not show reorder link if dragAndDrop = false', function() {
        expect(this.view).not.toContainElement(REORDER_LINK);
      });
    });

    describe('dragAndDrop = true', () => {
      beforeEach(function () {
        this.$scope.members = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
        this.$scope.dragAndDrop = true;
        this.$scope.$apply();
      });

      it('should show Reorder link if dragAndDrop = true', function() {
        expect(this.view).toContainElement(REORDER_LINK);
        expect(this.view).not.toContainElement(CANCEL_REORDER_LINK);
        expect(this.view).not.toContainElement(APPLY_REORDER_LINK);
      });

      it('should show Cancel and Apply links when Reorder is clicked', function() {
        this.view.find(REORDER_LINK).click();
        expect(this.view).toContainElement(CANCEL_REORDER_LINK);
        expect(this.view).toContainElement(APPLY_REORDER_LINK);
      });

      it('should show Reorder link when Cancel is clicked', function() {
        this.view.find(CANCEL_REORDER_LINK).click();
        expect(this.view).toContainElement(REORDER_LINK);
        expect(this.view).not.toContainElement(CANCEL_REORDER_LINK);
        expect(this.view).not.toContainElement(APPLY_REORDER_LINK);
      });
    });
  });

  describe('Filter displayed members', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.members = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
      this.$scope.filterBy = ['name', 'number'];
      this.$scope.$apply();
    });

    it('should only show members that match filtering for name', function() {
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_MEMBER_COUNT);
      this.view.find(SEARCH_MEMBER_INPUT).val('asg').change().blur();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(1);
    });

    it('should only show members that match filtering for number', function() {
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_MEMBER_COUNT);
      this.view.find(SEARCH_MEMBER_INPUT).val('2').change().blur();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(3);
    });
  });

  xdescribe('Add and delete members', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.members = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
      this.getMemberListDefer.resolve(this.typeaheadResults);
      this.$scope.$apply();
    });

    it('should show members when at least 3 character are entered in typeahead', function() {
      this.view.find(SEARCH_ADD_INPUT).val('cap').change();

      // this.$rootScope.$digest();
      this.view.find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_MEMBER_COUNT + 1);
    });
  });

});
