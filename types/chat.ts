export interface Chat {
  id: number,
  name: string | null;
  is_group: boolean;
  other_user?: {
    id: number;
    username: string;
    avatar_uel: string | null;
  };
  last_message?: string;
  last_message_time?: string;
}