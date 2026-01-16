import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithCorrelationID extends Request {
	correlationID?: string;
}

export function CorrelationIDMiddleware(
	req: RequestWithCorrelationID,
	res: Response,
	next: NextFunction,
) {
	const correlationID = uuidv4();
	req['correlationID'] = correlationID;
	res.setHeader('X-Correlation-ID', correlationID);
	next();
}
