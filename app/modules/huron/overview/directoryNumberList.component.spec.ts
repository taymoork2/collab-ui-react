import { IDirectoryNumber } from './directoryNumberList.component';

describe('Component: directoryNumberList', () => {

  describe('Line Display: numbers listed correctly', () => {

    let directoryNumbers: IDirectoryNumber[] = [
      {
        "dnUsage": "Primary",
        "uuid": "6d3f07a6-f868-4ae7-990d-286ce033834d",
        "pattern": "2329",
        "userDnUuid": "e67db8f7-4193-4b29-aa67-9a1096c2d87f",
        "dnSharedUsage": "Primary"
      },
      {
        "dnUsage": "",
        "uuid": "35fb962b-824c-44f3-9e13-2ed171e69249",
        "pattern": "5015",
        "userDnUuid": "374dc685-6be9-458e-b7f9-4ffb769662db",
        "altDnUuid": "77cb0209-d2cb-43c1-942b-1661d2dc7960",
        "altDnPattern": "7100XXXX",
        "dnSharedUsage": ""
      }
    ];

    beforeEach(function () {
      this.initModules('Huron');
      this.injectDependencies('$scope');
      this.$scope.directoryNumbers = directoryNumbers;
      this.compileComponent('directoryNumberList', {
        directoryNumbers: 'directoryNumbers',
        directoryNumberSref: 'test.state',
      });
    });

    it('should expose a `directoryNumbers` object', function () {
      expect(this.controller.directoryNumbers).toBeDefined();
      expect(this.controller.directoryNumbers.length).toBeGreaterThan(0);
      expect(this.controller.directoryNumbers[0].pattern).toBe('2329');
    });

    it('should create directory number link with usage type', function () {
      let firstNumber = this.view.find('li a').first();

      expect(firstNumber).toHaveAttr('ui-sref', 'test.state');
      expect(firstNumber).toContainText('2329');
      expect(firstNumber).not.toContainText('common.or');
      expect(firstNumber).toContainText('Primary');
    });

    it('should create directory number link with alt dn pattern', function () {
      let lastNumber = this.view.find('li a').last();

      expect(lastNumber).toHaveAttr('ui-sref', 'test.state');
      expect(lastNumber).toContainText('5015');
      expect(lastNumber).toContainText('common.or 7100XXXX');
    });
  });

  describe('Line Display: show more, less lines', () => {

    let directoryNumbers: IDirectoryNumber[] = [
      {
        "dnUsage": "Primary",
        "uuid": "6d3f07a6-f868-4ae7-990d-286ce033834d",
        "pattern": "2329",
        "userDnUuid": "e67db8f7-4193-4b29-aa67-9a1096c2d87f",
        "dnSharedUsage": "Primary"
      },
      {
        "dnUsage": "",
        "uuid": "35fb962b-824c-44f3-9e13-2ed171e69249",
        "pattern": "5015",
        "userDnUuid": "374dc685-6be9-458e-b7f9-4ffb769662db",
        "dnSharedUsage": ""
      },
      {
        "dnUsage": "",
        "uuid": "35fb962b-824c-44f3-9e13-2ed171e69248",
        "pattern": "5016",
        "userDnUuid": "374dc685-6be9-458e-b7f9-4ffb769652db",
        "dnSharedUsage": ""
      },
      {
        "dnUsage": "",
        "uuid": "35fb962b-824c-44f3-9e13-2ed171e69247",
        "pattern": "5017",
        "userDnUuid": "374dc685-6be9-458e-b7f9-4ffb769642db",
        "dnSharedUsage": ""
      },
      {
        "dnUsage": "",
        "uuid": "35fb962b-824c-44f3-9e13-2ed171e69246",
        "pattern": "5018",
        "userDnUuid": "374dc685-6be9-458e-b7f9-4ffb769632db",
        "dnSharedUsage": ""
      },
      {
        "dnUsage": "",
        "uuid": "35fb962b-824c-44f3-9e13-2ed171e69245",
        "pattern": "5019",
        "userDnUuid": "374dc685-6be9-458e-b7f9-4ffb769622db",
        "dnSharedUsage": ""
      }
    ];

    beforeEach(function () {
      this.initModules('Huron');
      this.injectDependencies('$scope');
      this.$scope.directoryNumbers = directoryNumbers;
      this.compileComponent('directoryNumberList', {
        directoryNumbers: 'directoryNumbers',
        directoryNumberSref: 'test.state',
      });
    });

    it('should show more button', function () {
      expect(this.controller.showMoreButton()).toBeTruthy();
      expect(this.controller.showLessButton()).toBeFalsy();
    });

    it('should show less when show more clicked', function () {
      this.controller.showMoreClicked();
      expect(this.controller.showMoreButton()).toBeFalsy();
      expect(this.controller.showLessButton()).toBeTruthy();
    });

    it('should show more when show less clicked', function () {
      this.controller.showLessClicked();
      expect(this.controller.showMoreButton()).toBeTruthy();
      expect(this.controller.showLessButton()).toBeFalsy();
    });
  });
});
