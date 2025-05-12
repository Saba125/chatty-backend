import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { CommentCache } from '@service/redis/comment.cache';
import { commentService } from '@service/db/comment.service';
import mongoose from 'mongoose';
import { ICommentDocument } from '@comment/interfaces/comment.interface';
const commentCache: CommentCache = new CommentCache();
export class Get {
  public async comment(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments = await commentCache.getCommentsFromCache(postId);
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post comments', comments });
  }
  public async commentNamesFromCache(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments = await commentCache.getCommentsNameFromCache(postId);
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post comments', comments });
  }
  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComments = await commentCache.getSingleCommentFromCace(postId, commentId);
    const comments: any = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Single comment', comments: comments[0] });
  }
}
