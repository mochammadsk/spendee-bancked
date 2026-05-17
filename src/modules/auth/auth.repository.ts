import { AuthModel } from './auth.model.js';

export const authRepository = {
  create(data: { email: string; password: string }) {
    return AuthModel.create(data);
  },

  findByEmail(email: string) {
    return AuthModel.findOne({ email });
  },

  findById(id: string) {
    return AuthModel.findById(id);
  },

  updateRefreshToken(userId: string, refreshToken: string | null) {
    return AuthModel.findByIdAndUpdate(userId, {
      refreshToken,
    });
  },
};
