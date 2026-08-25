export type ContactStatus = "new" | "read" | "archived";

export interface ContactEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}
