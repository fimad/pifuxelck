/** User contains all of the identifying information of a pifuxelck player. */
export type User = {
  id?: string,
  display_name?: string,
  password?: string,
}

/**
 * UserError is an error type that is returned when there is a problem
 * validating a user value.
 */
export type UserError = {
  id: string
  display_name: string[]
  password: string[]
}
