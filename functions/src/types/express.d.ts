// src/types/express.d.ts

//import { User } from '../users/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number; // `id`가 `number` 타입임을 명시
        kakao_id: string;
        email: string | null;
        nickname: string | null;
        profile_image_url: string | null;
        created_at: Date;
      };
    }
  }
}
