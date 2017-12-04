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
