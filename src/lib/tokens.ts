export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const setToken = (token: string, remember: boolean) => {
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};
