import { api } from "../lib/axiosClient";

export interface Item {
  itemID: number;
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
  itemPicture?: string | null;
  updatedOn?: string | null;
}

export interface CreateItemPayload {
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
  itemPicture?: string | null;
}

export interface UpdateItemPayload {
  itemID: number;
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
  updatedOn: string | null;
  itemPicture?: string | null;
}

export const itemService = {
  getList: async (): Promise<Item[]> => {
    const { data } = await api.get("/Item/GetList");
    return data;
  },

  create: async (payload: CreateItemPayload): Promise<Item> => {
    const { data } = await api.post("/Item", payload);
    return data;
  },

  update: async (payload: UpdateItemPayload): Promise<Item> => {
    const { data } = await api.put("/Item", payload);
    return data;
  },

  delete: async (itemID: number): Promise<void> => {
    await api.delete(`/Item/${itemID}`);
  },
};
