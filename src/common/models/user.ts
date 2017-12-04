/** User contains all of the identifying information of a pifuxelck player. */
export interface User {
  id?: string;
  display_name?: string;
  password?: string;
  email?: string;
}

/**
 * UserError is an error type that is returned when there is a problem
 * validating a user value.
 */
export interface UserError {
  id: string;
  display_name: string[];
  password: string[];
}
