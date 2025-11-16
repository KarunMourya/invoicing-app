export const getlocalStorageToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const getsessionStorageToken = () =>
  typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

export const getToken = () => {
  const localToken = getlocalStorageToken();
  if (localToken) return localToken;

  const sessionToken = getsessionStorageToken();
  if (sessionToken) return sessionToken;

  return null;
};

export const setToken = (token: string, remember: boolean) => {
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};
