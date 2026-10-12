export interface Receipt {
  id: number;
  title: string;
  amount: number;
  date: string;
  category?: string;
  hasImage: boolean;
  statusCode: string;
  createdDate: string;
}

export interface CreateReceiptRequest {
  title: string;
  amount: number;
  date: string;
  category?: string;
}

export interface UpdateReceiptRequest extends CreateReceiptRequest {
  id: number;
}
