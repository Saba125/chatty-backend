import { BaseCache } from './base.cache';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import Logger from 'bunyan';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { Helpers } from '@global/helpers/helpers';
import { find } from 'lodash';
const log: Logger = config.createLogger('commentsCache');
export class CommentCache extends BaseCache {
  constructor() {
    super('commentsCache');
  }
  public async addCommentToCache(postId: string, commentsData: ICommentDocument) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      await this.client.LPUSH(`comments:${postId}`, JSON.stringify(commentsData));
      const count: number = parseInt(postCount[0]) + 1;
      await this.client.HSET(`posts:${postId}`, ['commentsCount', count]);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again...');
    }
  }
  public async getCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const comments: ICommentDocument[] = [];
      for (const item of reply) {
        comments.push(Helpers.parseJson(item));
      }
      return comments;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again...');
    }
  }
  public async getCommentsNameFromCache(postId: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const commentCount: number = await this.client.LLEN(`comments:${postId}`);
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: string[] = [];
      for (const item of comments) {
        const comment: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
        list.push(comment.username);
      }
      const response: ICommentNameList = {
        count: commentCount,
        names: list
      };
      return [response];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again...');
    }
  }
  public async getSingleCommentFromCace(postId: string, commentId: string): Promise<ICommentDocument> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: ICommentDocument[] = [];

      for (const item of comments) {
        const parsed = Helpers.parseJson(item) as ICommentDocument;
        list.push(parsed);
      }

      const result: ICommentDocument | undefined = list.find((listItem) => listItem._id === commentId);

      if (!result) {
        throw new ServerError('Comment not found');
      }

      return result;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again...');
    }
  }
}
