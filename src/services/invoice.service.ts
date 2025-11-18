import { api } from "../lib/axiosClient";

export interface InvoiceLine {
  rowNo: number;
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
}

export interface Invoice {
  primaryKeyID: number;
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  address?: string;
  city?: string;
  totalItems: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  notes?: string;
  createdByUserName: string;
  createdOn: string;
  updatedByUserName: string;
  updatedOn: string | null;
}

export interface InvoiceDetail extends Omit<Invoice, "totalItems"> {
  lines: InvoiceLine[];
}

export interface CreateInvoicePayload {
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  address?: string;
  city?: string;
  taxPercentage: number;
  notes?: string;
  lines: InvoiceLine[];
}

export interface UpdateInvoicePayload extends CreateInvoicePayload {
  invoiceID: number;
  updatedOn: string | null;
}

export interface InvoiceMetrics {
  invoiceCount: number;
  totalAmount: number;
}

export interface InvoiceTrend {
  monthStart: string;
  invoiceCount: number;
  amountSum: number;
}

export interface TopItem {
  itemID: number;
  itemName: string;
  amountSum: number;
}

export interface InvoiceFilters {
  from?: string;
  to?: string;
  search?: string;
}

export const invoiceService = {
  getList: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append("fromDate", filters.from);
    if (filters?.to) params.append("toDate", filters.to);

    const { data } = await api.get(`/Invoice/GetList?${params.toString()}`);
    return data;
  },

  getById: async (invoiceID: number): Promise<InvoiceDetail> => {
    const { data } = await api.get<InvoiceDetail>(`/Invoice/${invoiceID}`);
    return data;
  },

  getMetrics: async (filters?: InvoiceFilters): Promise<InvoiceMetrics[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append("fromDate", filters.from);
    if (filters?.to) params.append("toDate", filters.to);

    const { data } = await api.get<InvoiceMetrics[]>(
      `Invoice/GetMetrices?${params.toString()}`
    );
    return data;
  },

  getTrend12m: async (date: string): Promise<InvoiceTrend[]> => {
    const { data } = await api.get<InvoiceTrend[]>(
      `Invoice/GetTrend12m?asOf=${date}`
    );
    return data;
  },

  getTopItems: async (
    topN: number,
    filters?: InvoiceFilters
  ): Promise<TopItem[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append("fromDate", filters.from);
    if (filters?.to) params.append("toDate", filters.to);
    params.append("topN", topN.toString());
    const { data } = await api.get<TopItem[]>(
      `Invoice/TopItems?${params.toString()}`
    );
    return data;
  },

  create: async (
    payload: CreateInvoicePayload
  ): Promise<{
    primaryKeyID: number;
    updatedOn: string | null;
    additionalResponseData: {
      SubTotal: number;
      TaxAmount: number;
      InvoiceAmount: number;
    };
    nofRecordsEffected: number;
  }> => {
    const { data } = await api.post("/Invoice/", payload);
    return data;
  },

  update: async (
    payload: UpdateInvoicePayload
  ): Promise<{
    primaryKeyID: number;
    updatedOn: string | null;
    additionalResponseData: {
      SubTotal: number;
      TaxAmount: number;
      InvoiceAmount: number;
    };
    nofRecordsEffected: number;
  }> => {
    const { data } = await api.put("/Invoice/", payload);
    return data;
  },

  delete: async (invoiceID: number): Promise<void> => {
    await api.delete(`Invoice/${invoiceID}`);
  },

  calculateLineAmount(
    quantity: number,
    rate: number,
    discountPct: number
  ): number {
    const subtotal = quantity * rate;
    const discount = (subtotal * discountPct) / 100;
    return subtotal - discount;
  },

  calculateTotals(
    lines: InvoiceLine[],
    taxPercentage: number
  ): {
    subtotal: number;
    taxAmount: number;
    total: number;
  } {
    const subtotal = lines.reduce((sum, line) => {
      return (
        sum +
        this.calculateLineAmount(line.quantity, line.rate, line.discountPct)
      );
    }, 0);

    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total,
    };
  },
};
