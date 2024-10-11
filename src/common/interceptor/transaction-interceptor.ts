import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { TransactionDatabase } from '../database/transaction';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private acceptMethods: string[] = ['POST', 'PUT', 'PATCH', 'DELETE'];
  constructor(private readonly transactionDatabase: TransactionDatabase) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (this.acceptMethods.includes(method)) {
      await this.transactionDatabase.startTransaction();
    }

    return next.handle().pipe(
      tap(async () => {
        if (this.acceptMethods.includes(method)) {
          try {
            await this.transactionDatabase.commitTransaction();
          } catch (commitError) {
            await this.transactionDatabase.rollBackTransaction();
          }
        }
      }),
      catchError(async (error) => {
        if (this.acceptMethods.includes(method)) {
          try {
            await this.transactionDatabase.rollBackTransaction();
          } catch (rollbackError) {}
        }
        throw error;
      }),
    );
  }
}
