import userTaskManagerModuleName from '../index';
import { TaskListFilterType } from '../user-task-manager.constants';

describe('Component: userTaskListFilter', () => {

  const FILTERS = '.task-list-filter';
  const ACTIVE_CLASS = 'task-list-filter--active';

  beforeEach(function() {
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

  it('should render filter buttons', function () {
    expect(this.view.find(FILTERS).length).toBe(2);
    expect(this.view.find(FILTERS).eq(0)).toHaveText('common.all');
    expect(this.view.find(FILTERS).eq(1)).toHaveText('common.active');
  });

  it('should initialize with an active filter', function () {
    expect(this.view.find(FILTERS).eq(0)).not.toHaveClass(ACTIVE_CLASS);
    expect(this.view.find(FILTERS).eq(1)).toHaveClass(ACTIVE_CLASS);
  });

  it('should trigger onFilterChange', function () {
    expect(this.view.find(FILTERS).eq(0)).not.toHaveClass(ACTIVE_CLASS);
    this.view.find(FILTERS).get(0).click();
    expect(this.$scope.onFilterChange).toHaveBeenCalledWith(TaskListFilterType.ALL);
    expect(this.view.find(FILTERS).eq(0)).toHaveClass(ACTIVE_CLASS);
  });
});
