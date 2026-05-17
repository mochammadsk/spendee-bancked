import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { authService } from './auth.service.js';
import type { LoginInput } from './auth.schema.js';
import { ApiResponse } from '../../shared/responses/api-response.js';

export const authController = {
  async login(c: Context) {
    const body = (await c.req.json()) as LoginInput;

    const result = await authService.login(body);

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return c.json(
      ApiResponse.success('Login success', {
        accessToken: result.accessToken,
      })
    );
  },

  async refresh(c: Context) {
    const refreshToken = getCookie(c, 'refreshToken');

    if (!refreshToken) {
      return c.json(ApiResponse.error('Unauthorized'), 401);
    }

    const result = await authService.refresh(refreshToken);

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return c.json(
      ApiResponse.success('Refresh success', {
        accessToken: result.accessToken,
      })
    );
  },

  async logout(c: Context) {
    const user = c.get('user');

    await authService.logout(user.userId);

    deleteCookie(c, 'refreshToken');

    return c.json(ApiResponse.success('Logout success'));
  },
};
