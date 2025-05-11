import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { reactionService } from '@service/db/reaction.service';
const log: Logger = config.createLogger('reactionsWorker');
class ReactionsWorker {
  async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.addReactionDataToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
  async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.removeReactionDataFromDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const reactionsWorker: ReactionsWorker = new ReactionsWorker();
