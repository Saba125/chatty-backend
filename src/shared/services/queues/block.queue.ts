import { BaseQueue } from './base.queue';
import { IBlockedUserJobData } from '@follower/interfaces/followers.interface';
import { blockWorker } from '@worker/blocked.worker';

class BlockQueue extends BaseQueue {
  constructor() {
    super('blockedUsers');
    this.processJob('addBlockedUserToDB', 5, blockWorker.blockUserWorker);
    this.processJob('removeBlockedUserToDB', 5, blockWorker.blockUserWorker);
  }
  public addBlockJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}
export const blockQueue: BlockQueue = new BlockQueue();
