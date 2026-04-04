export interface ChatInfo {
  id: number;
  name: string | null;
  is_group: boolean;
  other_user?: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
}