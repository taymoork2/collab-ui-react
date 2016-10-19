import { IPagingGroup } from '../pagingGroup';
import { INumber, PagingNumberService } from '../pgNumber.service';
import { PagingGroupService } from '../pagingGroup.service';

class PgEditComponentCtrl implements ng.IComponentController {

  private pgId: string;
  private pg: IPagingGroup;

  //Paging group name
  public name: string = '';
  public errorNameInput: boolean = false;
  public formChanged: boolean = false;

  //Paging group number
  public number: INumber;
  private availableNumbers: INumber[] = [];

  public back: boolean = true;
  public huronFeaturesUrl: string = 'huronfeatures';
  public saveInProgress: boolean = false;
  public form: ng.IFormController;

  /* @ngInject */
  constructor(private $state: ng.ui.IStateService,
              private $translate: ng.translate.ITranslateService,
              private Notification,
              private PagingGroupService: PagingGroupService,
              private PagingNumberService: PagingNumberService) {
  }

  public $onInit(): void {
    if (this.pgId) {
      this.pg = this.PagingGroupService.getPagingGroup(this.pgId);
      this.name = this.pg.name;
      this.number = this.pg.number;
      this.fetchNumbers();
    } else {
      this.$state.go(this.huronFeaturesUrl);
    }
  }

  public fetchNumbers(filter?: string): void {
    this.PagingNumberService.getNumberSuggestions(filter).then(
      (data: INumber[]) => {
        this.availableNumbers = data;
      }, (response) => {
        this.Notification.errorResponse(response, 'pagingGroup.numberFetchFailure');
      });
  }

  public onCancel(): void {
    this.name = this.pg.name;
    this.number = this.pg.number;
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
    let pg: IPagingGroup = <IPagingGroup>{
      name: this.name,
      number: this.number,
      uuid: this.pg.uuid,
    };
    this.PagingGroupService.updatePagingGroup(pg);
    this.Notification.success(this.$translate.instant('pagingGroup.successUpdate', {
      pagingGroupName: this.name,
    }));
    this.$state.go(this.huronFeaturesUrl);
  }

}

export class PgEditComponent implements ng.IComponentOptions {
  public controller = PgEditComponentCtrl;
  public templateUrl = 'modules/huron/features/pagingGroup/edit/pgEdit.html';
  public bindings = {
    pgId: '<',
  };
}
