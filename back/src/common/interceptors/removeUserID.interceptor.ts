import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function removeSensitiveInfo(obj: unknown): unknown {
	if (!obj) return obj;

	if (Array.isArray(obj)) {
		return obj.map(removeSensitiveInfo);
	} else if (obj instanceof Date) {
		return obj;
	} else if (typeof obj === 'object' && obj !== null) {
		const newObj = { ...(obj as Record<string, unknown>) };

		if ('password' in newObj) {
			delete newObj.password;
		}

		Object.keys(newObj).forEach((key) => {
			newObj[key] = removeSensitiveInfo(newObj[key]);
		});

		return newObj;
	}

	return obj;
}

@Injectable()
export class RemoveUserIdInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<unknown> {
		return next.handle().pipe(map(removeSensitiveInfo));
	}
}
