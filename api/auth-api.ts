import type {
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  TokenResponse,
  User,
} from "~/app/types/auth";

export const registerUser = async (
  credentials: RegisterCredentials,
  inviterId?: string
) => {
  const api = useApi();
  const response = await api.post("users/register/", {
    credentials,
    inviterId,
  });
  return response;
};

export const loginUser = async (credentials: LoginCredentials) => {
  const api = useApi();
  const response = await api.post("users/token/", credentials);
  return response as TokenResponse;
};

export const refreshToken = async (refreshToken: string) => {
  const api = useApi();
  const response = await api.post("users/token/refresh/", { refreshToken });
  return response as TokenResponse;
};

export const forgotPassword = async (email: string) => {
  const api = useApi();
  const response = await api.post("users/forgot-password/", { email });
  return response;
};

export const resetPassword = async (
  credentials: ResetPasswordCredentials,
  user_id: string,
  token: string
) => {
  const api = useApi();
  const response = await api.post(`users/reset-password/${user_id}/${token}/`, {
    user_id,
    token,
    credentials,
  });
  return response;
};

export const getAuthenticatedUser = async () => {
  const api = useApi();
  const response = await api.get("users/me/");
  return response as User;
};
