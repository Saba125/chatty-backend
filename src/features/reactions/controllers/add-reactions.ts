import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { addReactionSchema } from '../schemes/reactions.schemes';
import { IReactionDocument, IReactionJob } from '../interfaces/reactions.interface';
import { ReactionsCache } from '@service/redis/reactions.cache';
import { reactionsQueue } from '@service/queues/reactions.queue';
const reactionsCache: ReactionsCache = new ReactionsCache();
export class Add {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
    const reactionObject: IReactionDocument = {
      postId,
      type,
      avataColor: req.currentUser?.avatarColor,
      username: req.currentUser?.username,
      profilePicture
    } as IReactionDocument;
    await reactionsCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);
    const databaseReactionsData: IReactionJob = {
      postId,
      userTo,
      userFrom: req?.currentUser?.userId,
      username: req?.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    };
    reactionsQueue.addReactionJob('addReactionToDB', databaseReactionsData);
    res.status(HTTP_STATUS.CREATED).json({ message: 'Reaction added' });
  }
}
