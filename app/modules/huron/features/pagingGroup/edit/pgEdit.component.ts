import { IPagingGroup } from 'modules/huron/features/pagingGroup/pagingGroup';
import { PagingNumberService } from 'modules/huron/features/pagingGroup/pgNumber.service';
import { PagingGroupService } from 'modules/huron/features/pagingGroup/pagingGroup.service';

class PgEditComponentCtrl implements ng.IComponentController {

  private pgId: string;
  private pg: IPagingGroup;

  //Paging group name
  public name: string = '';
  public errorNameInput: boolean = false;
  public formChanged: boolean = false;

  //Paging group number
  public number: string;
  private availableNumbers: string[] = [];

  public back: boolean = true;
  public huronFeaturesUrl: string = 'huronfeatures';
  public saveInProgress: boolean = false;
  public form: ng.IFormController;
  public loading: boolean = true;

  /* @ngInject */
  constructor(private $state: ng.ui.IStateService,
              private $translate: ng.translate.ITranslateService,
              private Notification,
              private PagingGroupService: PagingGroupService,
              private PagingNumberService: PagingNumberService) {
  }

  public $onInit(): void {
    if (this.pgId) {
      this.PagingGroupService.getPagingGroup(this.pgId).then(
        (data) => {
          this.pg = data;
          this.name = this.pg.name;
          this.number = this.pg.extension;
          this.loading = false;
          }
      );
      this.fetchNumbers();
    } else {
      this.$state.go(this.huronFeaturesUrl);
    }
  }

  public fetchNumbers(filter?: string): void {
    this.PagingNumberService.getNumberSuggestions(filter).then(
      (data: string[]) => {
        this.availableNumbers = data;
      }, (response) => {
        this.Notification.errorResponse(response, 'pagingGroup.numberFetchFailure');
      });
  }

  public onCancel(): void {
    this.name = this.pg.name;
    this.number = this.pg.extension;
    this.errorNameInput = false;
    this.formChanged = false;
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public onChange(): void {
    let reg = /^[A-Za-z\-\_\d\s]+$/;
    this.errorNameInput = !reg.test(this.name);
    this.formChanged = true;
  }

  public showDisableSave() {
    return (this.form.$invalid || this.errorNameInput);
  }

  public saveForm(): void {
    let pg: IPagingGroup = <IPagingGroup>{};
    pg.groupId = this.pg.groupId;
    pg.name = this.name;
    pg.extension = this.number;
    this.PagingGroupService.updatePagingGroup(pg).then(
      (data) => {
        this.Notification.success(this.$translate.instant('pagingGroup.successUpdate', {
          pagingGroupName: data.name,
        }));
        this.$state.go(this.huronFeaturesUrl);
      },
      (error) => {
        let message = '';
        if (error && _.has(error, 'data')
          && _.has(error.data, 'error')
          && _.has(error.data.error, 'message')
          && _.has(error.data.error.message, 'length')
          && error.data.error.message.length > 0
          && _.has(error.data.error.message[0], 'description')) {
          message = error.data.error.message[0].description;
        }
        this.Notification.error('pagingGroup.errorUpdate', { message: message });
      });
  }

}

export class PgEditComponent implements ng.IComponentOptions {
  public controller = PgEditComponentCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/edit/pgEdit.html';
  public bindings = {
    pgId: '<',
  };
}
