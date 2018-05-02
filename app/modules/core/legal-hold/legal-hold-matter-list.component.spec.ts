import legalHoldModalModuleName, {
} from './index';
import { LegalHoldMatterListController } from './legal-hold-matter-list.component';
import { Matter } from './matter.model';

type Test = atlas.test.IComponentTest<LegalHoldMatterListController, {
  $q;
  $scope;
  Authinfo;
  LegalHoldService;
  Notification,
  Userservice,
}, {}>;

describe('Component: legalHoldMatterList', () => {

  const matters = getJSONFixture('core/json/legalHold/matters.json');
  const testMatterWithUsers = Matter.matterFromResponseData(matters[0]);
  const userCreators = {
    '384cf4cd-eea7-4c8c-83ee-67d88fc6eab4': {
      data: {
        name: {
          displayName: 'janedoe@gmail.com',
          givenName: 'Jane',
          familyName: 'Doe',
          id: '384cf4cd-eea7-4c8c-83ee-67d88fc6eab4',
        },
      },

    },
    '384cf4cd-eea7-4c8c-83ee-67d88fc6eab3': {
      data: {
        id: '384cf4cd-eea7-4c8c-83ee-67d88fc6eab3',
        userName: 'someyahoo@yanoo',
      },
    },
  };

  const testMatter = (_.cloneDeep(testMatterWithUsers));
  testMatter.userList = [];

  beforeEach(function (this: Test) {
    this.initModules(
      legalHoldModalModuleName,
    );
    this.injectDependencies(
      '$q',
      '$scope',
      'Authinfo',
      'LegalHoldService',
      'Notification',
      'Userservice',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.LegalHoldService, 'listMatters').and.returnValue(this.$q.resolve(matters));
    spyOn(this.Userservice, 'getUserAsPromise').and.callFake((userId: string) => {
      if (_.get(userCreators, userId)) {
        return (this.$q.resolve(_.get(userCreators, userId)));
      } else {
        return (this.$q.reject({ error: 'someError' }));
      }
    });
  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldMatterList', {
    });
  }

  function getNameDataFromUid(data: string[][], index: number): string {
    const uid = _.get(data, index + '.createdBy');
    const expectedName = _.get(userCreators, uid + '.data', null);
    if (!expectedName) {
      return 'legalHold.matterList.userNotFound';
    }
    if (_.get(expectedName, 'name')) {
      return <string>_.get(expectedName, 'name.givenName') + ' ' + <string>_.get(expectedName, 'name.familyName');
    } else {
      return _.get(expectedName, 'userName');
    }
  }

  describe('initial state', () => {
    it('should display the grid and populated the records without ay filters', function (this: Test) {
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(this.controller.gridData_.length).toBe(3);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(3);
      expect(this.LegalHoldService.listMatters).toHaveBeenCalledWith('123');
      expect(this.controller.currentFilter).toBeUndefined();
    });
    it('should display empty grid if no matters are returned', function (this: Test) {
      this.LegalHoldService.listMatters.and.returnValue(this.$q.resolve([]));
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(this.controller.gridData_.length).toBe(0);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBe(0);
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
    });
    it('should display error notification and empty grid if not matters', function (this: Test) {
      this.LegalHoldService.listMatters.and.returnValue(this.$q.reject({}));
      initComponent.apply(this);
      expect(this.view.find('cs-grid').length).toBe(1);
      expect(this.controller.gridData_.length).toBe(0);
      expect(_.get(this.controller.gridOptions, 'data.length')).toBeUndefined();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('basic functions', () => {
    beforeEach(initComponent);
    it('should filter records', function (this: Test) {
      this.controller.onChangeFilter(this.controller.filters[1]);
      const gridData = _.get(this.controller.gridOptions, 'data', []);
      expect(this.controller.gridData_.length).toBe(3);
      expect(gridData.length).toBe(2);
      expect(_.every(gridData, { matterState: 'active' })).toBeTruthy();
      expect(this.controller.currentFilter).toEqual(this.controller.filters[1]);
    });

    it('should search matter name and description for an entered string', function (this: Test) {
      this.controller.search('Assets22');
      const gridData = _.get(this.controller.gridOptions, 'data', []);
      expect(this.controller.gridData_.length).toBe(3);
      expect(gridData.length).toBe(1);
      expect(this.controller.currentFilter).toEqual(this.controller.filters[0]);
      expect(_.includes(gridData[0]['matterName'], 'Assets22') ||
        _.includes(gridData[0]['matterDescription'], 'Assets22')).toBeTruthy();
    });

    it('should asynchronously populate the matter craator user data based on the userId', function (this: Test) {
      this.controller.populateMatterCreators(matters)
        .then(() => {
          expect(this.Userservice.getUserAsPromise).toHaveBeenCalled();
          const gridData = _.get(this.controller.gridOptions, 'data', []);
          for (let i = 0; i < 3; i++) {
            const expectedName = getNameDataFromUid(gridData, i);
            expect(_.get(gridData[i], 'createdByName')).toEqual(expectedName);
          }
        })
        .catch((fail));
      this.$scope.$apply();
    });
  });
});

