import { BaseQueue } from './base.queue';
import { IReactionJob } from '@root/features/reactions/interfaces/reactions.interface';
import { reactionsWorker } from '@root/shared/workers/reactions.worker';

class ReactionsQueue extends BaseQueue {
  constructor() {
    super('reactionsQueue');
    this.processJob('addReactionToDB', 5, reactionsWorker.addReactionToDB);
    this.processJob('removeReactionFromDB', 5, reactionsWorker.removeReactionFromDB);
  }
  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}
export const reactionsQueue: ReactionsQueue = new ReactionsQueue();
