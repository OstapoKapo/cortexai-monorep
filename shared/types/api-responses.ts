export interface BaseResponse<T> {
  data: T;                
  statusCode: number;    
  timestamp: string;     
  message?: string;    
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;        
  timestamp: string;      
  path: string;           
  correlationID?: string; 
}

