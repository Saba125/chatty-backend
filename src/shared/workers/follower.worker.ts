import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { followerService } from '@service/db/follower.service';
const log: Logger = config.createLogger('emailWorker');
export class FollowerWorker {
  async addFollowerToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = job.data;
      await followerService.addFollowerToDB(keyOne, keyTwo, username, followerDocumentId);
      // add method to send data to a database
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
  async removeFollowerFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await followerService.removeFollowerFromDB(keyOne, keyTwo);
      // add method to send data to a database
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
export const followerWorker: FollowerWorker = new FollowerWorker();
