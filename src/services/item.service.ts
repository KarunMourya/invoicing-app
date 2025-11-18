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
  itemPicture?: File | null;
}

export interface UpdateItemPayload {
  itemID: number;
  itemName: string;
  description: string;
  salesRate: number;
  discountPct: number;
  updatedOn: string | null;
  itemPicture?: File | null;
}

export interface PostPutItemResponse {
  primaryKeyID: number;
  nofRecordseffected: number;
  updatedOn: string | null;
}

export const itemService = {
  getList: async (): Promise<Item[]> => {
    const { data } = await api.get("/Item/GetList");
    return data;
  },

  create: async (payload: CreateItemPayload): Promise<PostPutItemResponse> => {
    const { data } = await api.post("/Item", payload);
    return data;
  },

  update: async (payload: UpdateItemPayload): Promise<PostPutItemResponse> => {
    const { data } = await api.put("/Item", payload);
    return data;
  },

  delete: async (itemID: number): Promise<void> => {
    await api.delete(`/Item/${itemID}`);
  },

  updateItemPicture: async (itemID: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("ItemID", itemID.toString());
    formData.append("File", file);

    await api.post("/Item/UpdateItemPicture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getItemPicture: async (itemID: number): Promise<string | null> => {
      const { data } = await api.get(`/Item/PictureThumbnail/${itemID}`);
      return typeof data === "string" ? data : null;
  },
};
