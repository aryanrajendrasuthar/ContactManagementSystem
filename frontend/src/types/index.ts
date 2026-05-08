export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  _id: string;
  name: string;
  color: string;
  contactCount?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface SocialLinks {
  linkedin: string;
  twitter: string;
  github: string;
  website: string;
}

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: Address;
  tags: string[];
  groupId: Group | null;
  avatarUrl: string;
  isFavorite: boolean;
  notes: string;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  pages: number;
}

export type ViewMode = 'grid' | 'list';
