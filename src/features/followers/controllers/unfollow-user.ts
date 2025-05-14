import { Request, Response } from 'express';
import { mongo, ObjectId, Types } from 'mongoose';
import mongoose from 'mongoose';
import { FollowerCache } from '@service/redis/follower.cache';
import HTTP_STATUS from 'http-status-codes';
import { followerQueue } from '@service/queues/follower.queue';
const followerCache: FollowerCache = new FollowerCache();
export class Remove {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;
    const removeFollowerCache: Promise<void> = followerCache.removeFollowerFromCache(`followers:${req.currentUser?.userId}`, followeeId);
    const removeFolloweeCache: Promise<void> = followerCache.removeFollowerFromCache(`following:${followerId}`, followerId);
    // await Promise.all([removeFollowerCache, removeFolloweeCache]);
    const followersCount: Promise<void> = followerCache.updateFollowersCount(`${followeeId}`, 'followersCount', -1);
    const followeCount: Promise<void> = followerCache.updateFollowersCount(`${followerId}`, 'followingCount', -1);
    await Promise.all([removeFollowerCache, removeFolloweeCache, followersCount, followeCount]);

    followerQueue.addFollowerJob('removeFollowerFromDB', {
      keyOne: `${followeeId}`,
      keyTwo: `${followerId}`
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
