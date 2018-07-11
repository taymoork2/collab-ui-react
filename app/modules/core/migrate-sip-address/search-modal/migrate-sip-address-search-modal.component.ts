import { FilteredView } from 'modules/squared/common/filtered-view/filtered-view';
import { ICsdmFilteredViewFactory } from 'modules/squared/places/csdm-filtered-view-factory';
import { MigrateSipAddressService } from '../shared/migrate-sip-address.service';
import { CardMemberType, ICardMember } from '../shared/migrate-sip-address.types';

export class MigrateSipAddressSearchModal implements ng.IComponentController {
  public close: Function;
  public dismiss: Function;
  public searchString?: string;

  public selectedMembers: ICardMember[] = [];
  public isSearching = false;

  private filteredView: FilteredView<csdm.IPlace>;

  /* @ngInject */
  constructor(
    private CsdmFilteredViewFactory: ICsdmFilteredViewFactory,
    private MigrateSipAddressService: MigrateSipAddressService,
  ) {}

  public $onInit() {
    this.filteredView = this.CsdmFilteredViewFactory.createFilteredPlaceView();
  }

  public get hasMembers(): boolean {
    return this.selectedMembers.length > 0;
  }

  public formatResultLabel(member?: ICardMember): string {
    if (!member) {
      return '';
    }
    if (!member.subtitle) {
      return member.title;
    }
    return `${member.title} (${member.subtitle})`;
  }

  public search(query: string): ng.IPromise<ICardMember[]> {
    this.isSearching = true;
    return this.MigrateSipAddressService.searchForTestMembers({
      filteredPlaceView: this.filteredView,
      query,
      existingMembers: this.selectedMembers,
    }).finally(() => this.isSearching = false);
  }

  public selectMember(member: ICardMember): void {
    this.searchString = undefined;
    if (this.doesNotHaveSelectedMember(member)) {
      this.selectedMembers.push(member);
    }
  }

  public testMigrateSipAddress(): void {
    global.console.log('Users', this.selectedUserIds);
    global.console.log('Places', this.selectedPlaceIds);
    this.close();
  }

  public removeMember(member: ICardMember): void {
    _.remove(this.selectedMembers, member);
  }

  private doesNotHaveSelectedMember(member: ICardMember): boolean {
    const selectedMembersOfSameType = _.filter(this.selectedMembers, selectedMember => selectedMember.type === member.type);
    return !_.some(selectedMembersOfSameType, selectedMember => selectedMember.id === member.id);
  }

  private get selectedUserIds(): string[] {
    return _.filter(this.selectedMembers, member => member.type === CardMemberType.user)
      .map(member => member.id);
  }

  private get selectedPlaceIds(): string[] {
    return _.filter(this.selectedMembers, member => member.type === CardMemberType.place)
      .map(member => member.id);
  }
}

export class MigrateSipAddressSearchModalComponent implements ng.IComponentOptions {
  public controller = MigrateSipAddressSearchModal;
  public template = require('./migrate-sip-address-search-modal.html');
  public bindings = {
    close: '&',
    dismiss: '&',
  };
}
