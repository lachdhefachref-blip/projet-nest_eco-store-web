import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getStats() {
    return { message: 'stub admin stats' };
  }
}
