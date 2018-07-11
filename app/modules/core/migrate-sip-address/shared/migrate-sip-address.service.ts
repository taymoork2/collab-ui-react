import { FilteredView } from '../../../squared/common/filtered-view/filtered-view';
import { CardMemberType, ICardMember, ISipAddress, IUser } from './migrate-sip-address.types';

type IFilteredPlaceView = FilteredView<csdm.IPlace>;

export class MigrateSipAddressService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private UserListService,
  ) {}

  public searchForTestMembers(options: {
    existingMembers: ICardMember[],
    filteredPlaceView: IFilteredPlaceView,
    query: string,
  }): ng.IPromise<ICardMember[]> {
    const {
      existingMembers,
      filteredPlaceView,
      query,
    } = options;
    return this.$q.all({
      places: this.searchForPlaceMembers(query, existingMembers, filteredPlaceView),
      users: this.searchForUserMembers(query, existingMembers),
    }).then(promises => {
      return [...promises.users, ...promises.places];
    });
  }

  private searchForPlaceMembers(query: string, existingMembers: ICardMember[], filteredPlaceView: IFilteredPlaceView): ng.IPromise<ICardMember[]> {
    return filteredPlaceView.setCurrentSearch(query)
      .then(() => {
        const places = filteredPlaceView.getResult();
        const members = this.transformPlacesToMembers(places);
        return this.filterExistingMembers(members, existingMembers);
      })
      .catch(() => []);
  }

  private searchForUserMembers(query: string, existingMembers: ICardMember[]): ng.IPromise<ICardMember[]> {
    return this.searchUsers(query)
      .then(users => {
        const unmigratedUsers = this.filterUsersAlreadyMigrated(users);
        const members = this.transformUsersToMembers(unmigratedUsers);
        return this.filterExistingMembers(members, existingMembers);
      })
      .catch(() => []);
  }

  private transformPlacesToMembers(places: csdm.IPlace[]): ICardMember[] {
    return _.map(places, place => ({
      type: CardMemberType.place,
      id: place.cisUuid,
      title: place.displayName,
      subtitle: place.sipUrl,
    }));
  }

  private searchUsers(query: string): ng.IPromise<IUser[]> {
    return this.UserListService.listUsersAsPromise({
      attributes: 'name,userName,displayName,photos,sipAddresses',
      filter: {
        nameStartsWith: query,
      },
      noErrorNotificationOnReject: true,
    }).then(response => response.data.Resources);
  }

  private filterUsersAlreadyMigrated(users: IUser[]): IUser[] {
    return _.reject(users, user => {
      return _.some(user.sipAddresses, sipAddress => this.isSipAddressAlreadyMigrated(sipAddress));
    });
  }

  private getPrimarySipAddress(sipAddresses?: ISipAddress[]): string | undefined {
    if (!sipAddresses) {
      return;
    }
    return sipAddresses
      .filter(sipAddress => sipAddress.type === 'cloud-calling' && !!sipAddress.primary)
      .map(sipAddress => sipAddress.value)[0];
  }

  private filterExistingMembers(newMembers: ICardMember[], existingMembers: ICardMember[]): ICardMember[] {
    return _.differenceBy(newMembers, existingMembers, member => member.id);
  }

  private isSipAddressAlreadyMigrated(sipAddress: ISipAddress): boolean {
    // TODO reuse sip-address domain logic
    return !!sipAddress.primary && sipAddress.type === 'cloud-calling' && _.endsWith(sipAddress.value, 'calls.webex.com');
  }

  private transformUsersToMembers(users: IUser[]): ICardMember[] {
    return _.map(users, user => ({
      type: CardMemberType.user,
      id: user.id,
      title: user.userName,
      subtitle: this.getPrimarySipAddress(user.sipAddresses),
      image: this.getUserPhoto(user.photos),
    }));
  }

  private getUserPhoto(photos: IUser['photos']): string | undefined {
    if (!photos) {
      return;
    }
    return photos
      .filter(photo => photo.type === 'thumbnail')
      .map(photo => photo.value)[0];
  }
}
