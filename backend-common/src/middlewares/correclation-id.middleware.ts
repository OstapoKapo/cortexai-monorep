import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithCorrelationID extends Request {
    correlationID: string;
}

export function CorrelationIDMiddleware(
    req: RequestWithCorrelationID,
    res: Response,
    next: NextFunction,
) {
    let incomingId = req.headers['x-correlation-id'];
    if (Array.isArray(incomingId)) incomingId = incomingId[0];
    
    const correlationID = incomingId || uuidv4();

    req.correlationID = correlationID; 
    
    req.headers['x-correlation-id'] = correlationID; 
    
    res.setHeader('X-Correlation-ID', correlationID); 
    
    next();
}