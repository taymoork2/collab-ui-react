import moduleName from 'modules/integrations-management/index';
import { IntegrationsManagementTokens } from './integrations-management-tokens.component';
import { IntegrationsManagementService } from './integrations-management.service';
import { IUserInfo, UserQueryType } from './integrations-management.types';

type Test = atlas.test.IComponentTest<IntegrationsManagementTokens, {
  IntegrationsManagementService: IntegrationsManagementService,
  $timeout: ng.ITimeoutService,
}>;

describe('Component: integrationsManagementOverview', () => {
  beforeEach(function (this: Test) {
    this.initModules(
      moduleName,
      this.spyOnComponent('csTokenField'),
    );
    this.injectDependencies(
      'IntegrationsManagementService',
      '$timeout',
    );
    this.initSpies = (spies: {
      getUsers?,
      getUsersBulk?,
    } = {}) => {
      const {
        getUsers = this.$q.resolve(singleUser),
        getUsersBulk = this.$q.resolve(users),
      } = spies;
      spyOn(this.IntegrationsManagementService, 'getUsers').and.returnValue(getUsers);
      spyOn(this.IntegrationsManagementService, 'getUsersBulk').and.returnValue(getUsersBulk);
      this.$scope.fakeOnChangeFn = jasmine.createSpy('onChange');
      this.$scope.fakeSetValidFn = jasmine.createSpy('setValid');
    };

    this.initComponent = (options: {
      personIds?: string[],
    } = {}) => {
      const {
        personIds = [],
      } = options;
      this.$scope.fakePersonIds = personIds;
      this.compileComponent('integrationsManagementTokens', {
        personIds: 'fakePersonIds',
        onChange: 'fakeOnChangeFn(userIds)',
        setValid: 'fakeSetValidFn(isValid)',
      });
    };
  });

  it('should not try to find users but should display the field if nothing is passed from the parent', function (this: Test) {
    this.initSpies();
    this.initComponent();
    this.$timeout.flush();
    expect(this.IntegrationsManagementService.getUsersBulk).not.toHaveBeenCalled();
    expect(this.view.find('cs-token-field')).toExist();
  });

  it('should try to get user information for the user ids passed from the parent component', function (this: Test) {
    this.initSpies();
    const personIds = ['id1', 'id2', 'id3'];
    this.initComponent({ personIds: personIds });
    this.$timeout.flush();
    expect(this.IntegrationsManagementService.getUsersBulk).toHaveBeenCalledWith(UserQueryType.ID, personIds);
  });

  describe('creating a new token', function (this: Test) {
    const token = {
      attrs: {
        label: 'email@value',
        value: 'email@value',
        preventDefault: _.noop,
      },
    };

    function setUpNewToken(shouldInitSpies = true) {
      if (shouldInitSpies) {
        this.initSpies();
      }
      this.initComponent();
      this.$timeout.flush();
      this.controller.createToken(token);
      this.controller.createdToken(token);
    }

    it('should try to get user information for newly created token', function (this: Test) {
      setUpNewToken.call(this);
      this.$scope.$apply();
      expect(this.IntegrationsManagementService.getUsers).toHaveBeenCalledWith(UserQueryType.EMAIL, 'email@value');
    });

    it('should first set the parent state to invalid and after user found to valid and update the parent with new user\'s id', function (this: Test) {
      setUpNewToken.call(this);
      expect(this.$scope.fakeSetValidFn).toHaveBeenCalledWith(false);
      this.$scope.$apply();
      expect(this.$scope.fakeSetValidFn).toHaveBeenCalledWith(true);
      expect(this.$scope.fakeOnChangeFn).toHaveBeenCalledWith(['id123']);
    });

    it('should invalidate the parent if the user is not found and not update with the new id', function (this: Test) {
      this.initSpies({
        getUsers: this.$q.resolve([]),
      });
      setUpNewToken.call(this, false);
      expect(this.$scope.fakeSetValidFn).toHaveBeenCalledWith(false);
      this.$scope.$apply();
      expect(this.$scope.fakeSetValidFn).toHaveBeenCalledWith(false);
      expect(this.$scope.fakeSetValidFn.calls.count()).toBe(2);
      expect(this.$scope.fakeOnChangeFn).not.toHaveBeenCalled();
    });
  });
});

const users: IUserInfo[] = [
  {
    id: 'id1',
    username: 'username1@gmail.com',
  },
  {
    id: 'id2',
    username: 'username1@gmail.com',
  },
];

const singleUser: IUserInfo[] = [{
  id: 'id123',
  username: 'email@value',
}];
