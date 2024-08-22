// src/users/user.entity.ts

export class User {
    id?: number;
    kakao_id?: string;
    email?: string | null;
    nickname?: string | null;
    profile_image_url?: string | null;
    created_at?: Date;
  
    constructor(partial: Partial<User>) {
      Object.assign(this, partial);
    }
  }