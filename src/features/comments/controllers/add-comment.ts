import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionsCache } from '@service/redis/reactions.cache';
import { reactionsQueue } from '@service/queues/reactions.queue';
import { addCommentSchema } from '@comment/schemes/comments.schemes';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import mongoose, { ObjectId } from 'mongoose';
import { CommentCache } from '@service/redis/comment.cache';
import { commentQueue } from '@service/queues/comment.queue';
const commentCache: CommentCache = new CommentCache();
export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;
    const commentObjectId = new mongoose.Types.ObjectId();
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.userId}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      comment,
      createdAt: new Date()
    } as ICommentDocument;
    await commentCache.addCommentToCache(postId, commentData);
    const dataToSave: ICommentJob = {
      comment,
      postId,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      userTo
    };
    commentQueue.addCommentJob('addCommentToDB', dataToSave);
    res.status(HTTP_STATUS.CREATED).json({ message: 'Comment added' });
  }
}
