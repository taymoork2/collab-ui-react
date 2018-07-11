export enum CardMemberType {
  place = 'place',
  user = 'user',
}

export interface ICardMember {
  type: CardMemberType;
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
}

export interface ISipAddress {
  type: string;
  value: string;
  primary?: boolean;
}

export interface IUser {
  userName: string;
  name?: { givenName?: string, familyName?: string };
  id: string;
  displayName: string;
  sipAddresses: ISipAddress[];
  photos?: { type: 'photo' | 'thumbnail', value: string }[];
}
