import { IPostJobData } from '@root/features/posts/interfaces/post.interface';
import { BaseQueue } from './base.queue';
import { postWorker } from '@root/shared/workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('postQueue');
    // this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
    this.processJob('addPostToDB', 5, postWorker.savePostToDB);
    this.processJob('deletePostFromDB', 5, postWorker.deletePostFromDB);
    this.processJob('updatePostFromDB', 5, postWorker.updatePostFromDB);
  }
  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}
export const postQueue: PostQueue = new PostQueue();
