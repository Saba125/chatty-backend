import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { commentService } from '@service/db/comment.service';
import { blockUserService } from '@service/db/block-user.service';
const log: Logger = config.createLogger('commentWorker');
class BlockWorker {
  async blockUserWorker(job: Job, done: DoneCallback): Promise<void> {
    try {
      const {  keyOne,keyTwo,type } = job.data;
      if (type === 'block') {
        await blockUserService.blockUser(keyOne, keyTwo);
      } else {
        await blockUserService.unBlockUser(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const blockWorker: BlockWorker = new BlockWorker();
