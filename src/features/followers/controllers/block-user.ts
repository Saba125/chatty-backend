import { Request, Response } from 'express';
import { mongo, ObjectId, Types } from 'mongoose';
import mongoose from 'mongoose';
import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@root/features/user/interfaces/user.interface';
import { IFollowerData } from '@follower/interfaces/followers.interface';
import HTTP_STATUS from 'http-status-codes';
import { SocketIoFollowerHandler, socketIOFollowerObject } from '@socket/follower';
import { followerQueue } from '@service/queues/follower.queue';
import { blockQueue } from '@service/queues/block.queue';
const followerCache: FollowerCache = new FollowerCache();
export class AddBlock {
  public async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddBlock.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'block');
    blockQueue.addBlockJob('addBlockedUserToDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      type: 'block'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }
  public async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddBlock.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'unblock');
    blockQueue.addBlockJob('removeBlockedUserToDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }
  private async updateBlockedUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
    const blockedBy = followerCache.updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
    const blocked = followerCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${userId}`, type);
    await Promise.all([blocked, blockedBy]);
  }
}
