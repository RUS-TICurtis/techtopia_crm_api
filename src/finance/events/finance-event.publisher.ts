import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class FinanceEventPublisher extends EventEmitter {
  publish(event: string, payload: any) {
    this.emit(event, payload);
    console.log(`[Finance Event] ${event} published:`, JSON.stringify(payload));
  }
}
