import './task-list-filter.scss';
import { TaskListFilterType } from '../user-task-manager.constants';

export class TaskListFilterController implements ng.IComponentController {
  public TaskListFilter = TaskListFilterType;
  public filter: TaskListFilterType;
  public onFilterChange: Function;
  public filters: { type: TaskListFilterType, label: string }[];

  private activeFilter: TaskListFilterType;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.filters = [{
      type: TaskListFilterType.ALL,
      label: this.$translate.instant('common.all'),
    }, {
      type: TaskListFilterType.ACTIVE,
      label: this.$translate.instant('common.active'),
    }, {
      type: TaskListFilterType.ERROR,
      label: this.$translate.instant('common.errors'),
    }];
  }

  public $onChanges(changes: ng.IOnChangesObject) {
    if (changes.filter) {
      this.activeFilter = changes.filter.currentValue;
    }
  }

  public isActive(filter: TaskListFilterType) {
    return filter === this.activeFilter;
  }

  public setActive(filter: TaskListFilterType) {
    this.activeFilter = filter;
    this.onFilterChange({
      filter,
    });
  }
}

export class TaskListFilterComponent implements ng.IComponentOptions {
  public controller = TaskListFilterController;
  public template = require('./task-list-filter.html');
  public bindings = {
    filter: '<',
    onFilterChange: '&',
  };
}
