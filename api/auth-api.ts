import type {
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  TokenResponse,
  User,
} from "~/types/auth";

export const registerUser = async (
  credentials: RegisterCredentials,
  inviterId?: string
) => {
  const api = useApi();
  const response = await api.post("auth.register", { credentials, inviterId });
  return response;
};

export const loginUser = async (credentials: LoginCredentials) => {
  const api = useApi();
  const response = await api.post("auth.login", credentials);
  return response as TokenResponse;
};

export const refreshToken = async (refreshToken: string) => {
  const api = useApi();
  const response = await api.post("auth.refreshToken", { refreshToken });
  return response as TokenResponse;
};

export const forgotPassword = async (email: string) => {
  const api = useApi();
  const response = await api.post("auth.forgotPassword", { email });
  return response;
};

export const resetPassword = async (
  credentials: ResetPasswordCredentials,
  user_id: string,
  token: string
) => {
  const api = useApi();
  const response = await api.post("auth.resetPassword", {
    credentials,
    user_id,
    token,
  });
  return response;
};

export const getAuthenticatedUser = async () => {
  const api = useApi();
  const response = await api.get("auth.getUser");
  return response as User;
};
