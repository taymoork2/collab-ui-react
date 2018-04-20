import { Line } from '../lines/services';

describe('Component: directoryNumberList', () => {

  describe('Line Display: numbers listed correctly', () => {

    const LINE_LABEL = '.line-label';
    const directoryNumbers: Line[] = [
      {
        uuid: '6d3f07a6-f868-4ae7-990d-286ce033834d',
        internal: '2329',
        external: '',
        siteToSite: '71002329',
        incomingCallMaximum: 2,
        primary: true,
        shared: false,
        label: {
          value: 'someuser@some.com',
          appliesToAllSharedLines: false,
        },
      },
      {
        uuid: '35fb962b-824c-44f3-9e13-2ed171e69249',
        internal: '5015',
        external: '7100XXXX',
        siteToSite: '71005015',
        incomingCallMaximum: 8,
        primary: false,
        shared: false,
        label: {
          value: 'someuser2@some.com',
          appliesToAllSharedLines: false,
        },
      },
    ];

    beforeEach(function () {
      this.initModules('Huron');
      this.injectDependencies(
        '$scope',
        '$q',
      );
      this.$scope.directoryNumbers = directoryNumbers;
      this.compileComponent('directoryNumberList', {
        directoryNumbers: 'directoryNumbers',
        directoryNumberSref: 'test.state',
      });
    });

    it('should expose a `directoryNumbers` object', function () {
      expect(this.controller.directoryNumbers).toBeDefined();
      expect(this.controller.directoryNumbers.length).toBeGreaterThan(0);
      expect(this.controller.directoryNumbers[0].internal).toBe('2329');
    });

    it('should create directory number link with usage type', function () {
      const firstNumber = this.view.find('li a').first();

      expect(firstNumber).toHaveAttr('ui-sref', 'test.state');
      expect(firstNumber).toContainText('2329');
      expect(firstNumber).not.toContainText('common.or');
      expect(firstNumber).toContainText('helpdesk.primary');
    });

    it('should create directory number link with alt dn pattern', function () {
      const lastNumber = this.view.find('li a').last();
      expect(lastNumber).toHaveAttr('ui-sref', 'test.state');
      expect(lastNumber).toContainText('5015');
      expect(lastNumber).toContainText('common.or 7100XXXX');
    });

    it('should display line label - check the first line', function () {
      expect(this.view.find(LINE_LABEL).get(0)).toContainText('someuser@some.com');
    });
  });

  describe('Line Display: show more, less lines', () => {

    const directoryNumbers: Line[] = [
      {
        uuid: '6d3f07a6-f868-4ae7-990d-286ce033834d',
        internal: '2329',
        external: '',
        siteToSite: '71002329',
        incomingCallMaximum: 2,
        primary: true,
        shared: false,
        label: {
          value: 'someuser@some.com',
          appliesToAllSharedLines: false,
        },
      },
      {
        uuid: '35fb962b-824c-44f3-9e13-2ed171e69249',
        internal: '5015',
        external: '7100XXXX',
        siteToSite: '71005015',
        incomingCallMaximum: 8,
        primary: false,
        shared: false,
        label: {
          value: 'someuser2@some.com',
          appliesToAllSharedLines: false,
        },
      },
      {
        uuid: '35fb962b-824c-44f3-9e13-2ed171e69248',
        internal: '5016',
        external: '7100XXXX',
        siteToSite: '71005016',
        incomingCallMaximum: 8,
        primary: false,
        shared: false,
        label: {
          value: 'someuser3@some.com',
          appliesToAllSharedLines: false,
        },
      },
      {
        uuid: '35fb962b-824c-44f3-9e13-2ed171e69247',
        internal: '5017',
        external: '7100XXXX',
        siteToSite: '71005017',
        incomingCallMaximum: 8,
        primary: false,
        shared: false,
        label: {
          value: 'someuser4@some.com',
          appliesToAllSharedLines: false,
        },
      },
      {
        uuid: '35fb962b-824c-44f3-9e13-2ed171e69246',
        internal: '5018',
        external: '7100XXXX',
        siteToSite: '71005018',
        incomingCallMaximum: 8,
        primary: false,
        shared: false,
        label: {
          value: 'someuser5@some.com',
          appliesToAllSharedLines: false,
        },
      },
      {
        uuid: '35fb962b-824c-44f3-9e13-2ed171e69245',
        internal: '5019',
        external: '7100XXXX',
        siteToSite: '71005019',
        incomingCallMaximum: 8,
        primary: false,
        shared: false,
        label: {
          value: 'someuser6@some.com',
          appliesToAllSharedLines: false,
        },
      },
    ];

    beforeEach(function () {
      this.initModules('Huron');
      this.injectDependencies(
        '$scope',
        '$q',
      );
      this.$scope.directoryNumbers = directoryNumbers;
      this.compileComponent('directoryNumberList', {
        directoryNumbers: 'directoryNumbers',
        directoryNumberSref: 'test.state',
        lineThreshold: '5', // NOTE: Bound as a string (@) but member is a number
      });
    });

    it('should show more button', function () {
      expect(this.controller.showMoreButton()).toBeTruthy();
      expect(this.controller.showLessButton()).toBeFalsy();
      expect(this.view.find('li a').length).toEqual(5);
    });

    it('should display Show less button, but more numbers when Show more clicked', function () {
      this.controller.showMoreClicked();
      this.$scope.$apply();
      expect(this.controller.showMoreButton()).toBeFalsy();
      expect(this.controller.showLessButton()).toBeTruthy();
      expect(this.view.find('li a').length).toEqual(6);
    });

    it('should display Show more button, but less numbers when Show less clicked', function () {
      this.controller.showLessClicked();
      this.$scope.$apply();
      expect(this.controller.showMoreButton()).toBeTruthy();
      expect(this.controller.showLessButton()).toBeFalsy();
      expect(this.view.find('li a').length).toEqual(5);
    });
  });
});
