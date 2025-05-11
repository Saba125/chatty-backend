import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { removeReactionSchema } from '../schemes/reactions.schemes';
import { IReactionJob } from '../interfaces/reactions.interface';
import { ReactionsCache } from '@service/redis/reactions.cache';
import { reactionsQueue } from '@service/queues/reactions.queue';
const reactionsCache: ReactionsCache = new ReactionsCache();
export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions } = req.params;

    await reactionsCache.removePostReactionFromCache(postId, `${req.currentUser?.username}`, JSON.parse(postReactions));
    const databaseReactionsData: IReactionJob = {
      postId,
      username: req?.currentUser!.username,
      previousReaction
    };
    reactionsQueue.addReactionJob('removeReactionFromDB', databaseReactionsData);
    res.status(HTTP_STATUS.CREATED).json({ message: 'Reaction remove from post' });
  }
}
