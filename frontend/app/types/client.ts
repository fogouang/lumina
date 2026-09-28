export type ClientStatus = "active" | "prospect" | "inactive";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  status: ClientStatus;
  createdAt: string;
}

export type NewClient = Omit<Client, "id" | "createdAt">;