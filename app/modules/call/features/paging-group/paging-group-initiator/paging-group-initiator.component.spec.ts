import pagingGroupInitiatorModule from './index';

describe('Component: ucPagingGroupInitiator', () => {
  const DISPLAYED_INITIATOR_COUNT = 10;
  const INITIATOR_COUNT = 11;
  const CS_CARD_MEMBER = 'cs-card-member';
  const SHOW_MORE_LESS_LINK = '.members-footer a';
  const SEARCH_INITIATOR_INPUT = 'input#search-initiator-box';

  const typeaheadResults = getJSONFixture('huron/json/features/callFeatureMembers/typeaheadMemberResponse.json');

  beforeEach(function () {
    this.initModules(pagingGroupInitiatorModule);
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
    this.compileComponent('ucPagingGroupInitiator', {
      initiators: 'initiators',
      ititiatorType: 'ititiatorType',
      onChangeFn: 'onChangeFn(initiatorType, initiators)',
    });
  }

  describe('Handle showing/hiding members when member count > 10', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.initiators = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
      this.$scope.$apply();
    });

    it('should display only 10 members initially', function() {
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_INITIATOR_COUNT);
    });

    it('should display all 11 members when Show More is clicked', function() {
      this.view.find(SHOW_MORE_LESS_LINK).get(0).click();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(INITIATOR_COUNT);
    });

    it('should display only 10 members when Show Less is clicked', function() {
      this.view.find(SHOW_MORE_LESS_LINK).get(1).click();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_INITIATOR_COUNT);
    });
  });

  describe('Filter displayed members', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.initiators = getJSONFixture('huron/json/features/callFeatureMembers/largeMemberList.json');
      this.$scope.$apply();
    });

    it('should only show members that match filtering for name', function() {
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_INITIATOR_COUNT);
      this.view.find(SEARCH_INITIATOR_INPUT).val('asg').change().blur();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(1);
    });

    it('should only show members that match filtering for number', function() {
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(DISPLAYED_INITIATOR_COUNT);
      this.view.find(SEARCH_INITIATOR_INPUT).val('2').change().blur();
      expect(this.view.find(CS_CARD_MEMBER).length).toEqual(3);
    });
  });
});
