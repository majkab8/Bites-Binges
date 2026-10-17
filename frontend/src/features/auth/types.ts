export type User = {
  id: number;
  email: string;
  username: string;
  display_name: string;
  color: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  username: string;
  password: string;
  display_name?: string;
};
