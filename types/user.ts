export interface User {
  id: number;
  email: string;
  username: string;
  avatar_uel?: string;
  online?: boolean;
  last_seen?: string;
}