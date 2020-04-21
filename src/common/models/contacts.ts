import { User } from './user';

export interface ContactGroup {
  /** The ID of the contact group. */
  id?: string;

  /** The human readable group name. */
  name: string;

  /**
   * An un-ordered list of account IDs that comprise the members of the group.
   */
  members?: User[];
}

export interface SuggestedContact {
  /** The ID of the contact. */
  id: string;

  /** The contact's display name. */
  display_name: string;

  /** Number of contacts who have added both the current user and this user. */
  common_contacts: number;

  /**
   * True if this suggested user has added the current user as a contact.
   */
  added_current_user: boolean;

  /**
   * If true, the user does not wish to see this suggested in their inbox.
   */
  no_thanks: boolean;
}
