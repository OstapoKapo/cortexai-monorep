export interface Template {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  originalFileName: string;
  mimeType: string | null;
  size: number | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}