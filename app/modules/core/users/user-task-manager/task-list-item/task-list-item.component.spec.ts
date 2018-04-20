import userTaskManagerModuleName from '../index';
import { TaskListItemController } from './task-list-item.component';

type Test = atlas.test.IComponentTest<TaskListItemController>;

describe('Component: userTaskListItem', () => {

  const TASK = '.task';
  const TASK__ROW = '.task__row';
  const TASK__TEXT = '.task__text';
  const TASK__SUBTEXT = '.task__subtext';
  const TASK_TEXT_RIGHT_CLASS = 'task__text--right';
  const TASK_SUBTEXT_RIGHT_CLASS = 'task__subtext--right';
  const ACTIVE_CLASS = 'task--active';

  beforeEach(function (this: Test) {
    this.initModules(userTaskManagerModuleName);
    this.compileComponent('userTaskListItem', {
      isActiveTask: false,
      task: {
        jobTypeTranslate: 'CSV Import',
        createdTime: '10:00 AM',
        statusTranslate: 'Created',
        createdDate: 'Nov 2, 2017',
      },
    });
  });

  it('should show active task', function (this: Test) {
    expect(this.view.find(TASK)).not.toHaveClass(ACTIVE_CLASS);
    this.$scope.isActiveTask = true;
    this.$scope.$apply();
    expect(this.view.find(TASK)).toHaveClass(ACTIVE_CLASS);
  });

  it('should render task data', function (this: Test) {
    expect(this.view.find(TASK__ROW).eq(0).find(TASK__TEXT).eq(0)).toHaveText('CSV Import');
    expect(this.view.find(TASK__ROW).eq(0).find(TASK__TEXT).eq(1)).toHaveText('10:00 AM');
    expect(this.view.find(TASK__ROW).eq(0).find(TASK__TEXT).eq(1)).toHaveClass(TASK_TEXT_RIGHT_CLASS);
    expect(this.view.find(TASK__ROW).eq(1).find(TASK__SUBTEXT).eq(0)).toHaveText('Created');
    expect(this.view.find(TASK__ROW).eq(1).find(TASK__SUBTEXT).eq(1)).toHaveText('Nov 2, 2017');
    expect(this.view.find(TASK__ROW).eq(1).find(TASK__SUBTEXT).eq(1)).toHaveClass(TASK_SUBTEXT_RIGHT_CLASS);
  });
});
