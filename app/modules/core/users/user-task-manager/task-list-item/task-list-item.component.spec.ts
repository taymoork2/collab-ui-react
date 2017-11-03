import userTaskManagerModuleName from '../index';

describe('Component: userTaskListItem', () => {

  const TASK = '.task';
  const TASK__ROW = '.task__row';
  const TASK__TEXT = '.task__text';
  const TASK__SUBTEXT = '.task__subtext';
  const TASK_TEXT_RIGHT_CLASS = 'task__text--right';
  const TASK_SUBTEXT_RIGHT_CLASS = 'task__subtext--right';
  const ACTIVE_CLASS = 'task--active';

  beforeEach(function () {
    this.initModules(userTaskManagerModuleName);
    this.compileComponent('userTaskListItem', {
      isActiveTask: false,
      task: {
        jobInstanceId: '123',
        started: 'Jan 1',
        status: 'STARTED',
        stopped: 'Jan 2',
      },
    });
  });

  it('should show active task', function () {
    expect(this.view.find(TASK)).not.toHaveClass(ACTIVE_CLASS);
    this.$scope.isActiveTask = true;
    this.$scope.$apply();
    expect(this.view.find(TASK)).toHaveClass(ACTIVE_CLASS);
  });

  it('should render task data', function () {
    expect(this.view.find(TASK__ROW).eq(0).find(TASK__TEXT).eq(0)).toHaveText('123');
    expect(this.view.find(TASK__ROW).eq(0).find(TASK__TEXT).eq(1)).toHaveText('Jan 1');
    expect(this.view.find(TASK__ROW).eq(0).find(TASK__TEXT).eq(1)).toHaveClass(TASK_TEXT_RIGHT_CLASS);
    expect(this.view.find(TASK__ROW).eq(1).find(TASK__SUBTEXT).eq(0)).toHaveText('STARTED');
    expect(this.view.find(TASK__ROW).eq(1).find(TASK__SUBTEXT).eq(1)).toHaveText('Jan 2');
    expect(this.view.find(TASK__ROW).eq(1).find(TASK__SUBTEXT).eq(1)).toHaveClass(TASK_SUBTEXT_RIGHT_CLASS);
  });
});
