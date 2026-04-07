
export interface Template {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  originalFileName: string;
  mimeType: string | null;
  size: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
// --- Template Request Types ---
export interface CreateTemplateRequest {
  name: string;
  description?: string;
}

// --- Template Response Types ---
export interface UploadTemplateResponse {
  url: string;
  message: string;
}

export interface GetTemplatesResponse {
  message: string;
  templates: Template[];
}

export interface DeleteTemplateResponse {
  message: string;
}

export interface DownloadTemplateResponse {
  url: string;
  message: string;
}
