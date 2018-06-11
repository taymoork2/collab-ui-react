import userTaskManagerModuleName from '../index';
import { TaskListFilterType } from '../user-task-manager.constants';
import { TaskListFilterController } from './task-list-filter.component';

type Test = atlas.test.IComponentTest<TaskListFilterController>;

describe('Component: userTaskListFilter', () => {

  const FILTERS = '.task-list-filter';
  const ACTIVE_CLASS = 'task-list-filter--active';

  beforeEach(function (this: Test) {
    this.initModules(userTaskManagerModuleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onFilterChange = jasmine.createSpy('onFilterChange');
    this.compileComponent('userTaskListFilter', {
      filter: TaskListFilterType.ACTIVE,
      onFilterChange: 'onFilterChange(filter)',
    });
  });

  it('should render filter buttons', function (this: Test) {
    expect(this.view.find(FILTERS).length).toBe(3);
    expect(this.view.find(FILTERS).eq(0)).toHaveText('common.all');
    expect(this.view.find(FILTERS).eq(1)).toHaveText('common.active');
    expect(this.view.find(FILTERS).eq(2)).toHaveText('common.errors');
  });

  it('should initialize with an active filter', function (this: Test) {
    expect(this.view.find(FILTERS).eq(0)).not.toHaveClass(ACTIVE_CLASS);
    expect(this.view.find(FILTERS).eq(1)).toHaveClass(ACTIVE_CLASS);
  });

  it('should trigger onFilterChange', function (this: Test) {
    expect(this.view.find(FILTERS).eq(0)).not.toHaveClass(ACTIVE_CLASS);
    this.view.find(FILTERS).get(0).click();
    expect(this.$scope.onFilterChange).toHaveBeenCalledWith(TaskListFilterType.ALL);
    expect(this.view.find(FILTERS).eq(0)).toHaveClass(ACTIVE_CLASS);
  });
});
