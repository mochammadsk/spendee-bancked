export interface IUser {
  _id: any;
  email: string;
  full_name: string;
  user_name: string;
  verified: boolean;
  password?: string;
}
