import { IPostJobData } from '@root/features/posts/interfaces/post.interface';
import { BaseQueue } from './base.queue';
import { postWorker } from '@worker/post.worker';
import { commentWorker } from '@worker/comment.worker';
import { ICommentJob } from '@comment/interfaces/comment.interface';

class CommentQueue extends BaseQueue {
  constructor() {
    super('commentQeueue');
    // this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
    this.processJob('addCommentToDB', 5, commentWorker.addComment);
  }
  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}
export const commentQueue: CommentQueue = new CommentQueue();
