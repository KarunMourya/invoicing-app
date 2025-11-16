import { api } from "../lib/axiosClient";

interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  address: string;
  city: string;
  zipCode: string;
  industry: string;
  currencySymbol: string;
  logo?: File | null;
}

export const loginService = async (payload: LoginPayload) => {
  const { data } = await api.post("/Auth/Login", payload, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return data;
};

export const signupService = async (payload: SignupPayload) => {
  const formData = new FormData();

  formData.append("FirstName", payload.firstName);
  formData.append("LastName", payload.lastName);
  formData.append("Email", payload.email);
  formData.append("Password", payload.password);
  formData.append("CompanyName", payload.companyName);
  formData.append("Address", payload.address);
  formData.append("City", payload.city);
  formData.append("ZipCode", payload.zipCode);
  formData.append("Industry", payload.industry);
  formData.append("CurrencySymbol", payload.currencySymbol);

  if (payload.logo) {
    formData.append("logo", payload.logo);
  }

  const { data } = await api.post("/Auth/Signup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
