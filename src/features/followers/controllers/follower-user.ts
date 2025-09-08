import { Request, Response } from 'express';
import { mongo, ObjectId, Types } from 'mongoose';
import mongoose from 'mongoose';
import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@root/features/user/interfaces/user.interface';
import { IFollowerData } from '@follower/interfaces/followers.interface';
import HTTP_STATUS from "http-status-codes"
import { SocketIoFollowerHandler, socketIOFollowerObject } from '@socket/follower';
import { followerQueue } from '@service/queues/follower.queue';
const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();
export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    // update count in cache
    const followersCount: Promise<void> = followerCache.updateFollowersCount(`${followerId}`, 'followersCount', 1);
    const followeCount: Promise<void> = followerCache.updateFollowersCount(`${req.currentUser?.userId}`, 'followingCount', 1);
    const followerObjectId = new mongoose.Types.ObjectId();
    await Promise.all([followersCount, followeCount]);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser?.userId}`) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollowee,cachedFollower]);
    const addFolloweeData:IFollowerData = Add.prototype.userData(response[0]);
    // send data to client with socket

    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser?.userId}`, `${followerId}`);
    socketIOFollowerObject.emit('add follower', addFolloweeData);
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${followerId}`,`${req.currentUser?.userId}`);
    await Promise.all([addFollowerToCache, addFolloweeToCache]);
    // send data to queue
    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne:`${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      username: req.currentUser?.username,
      followerDocumentId:followerObjectId
    });
    res.status(HTTP_STATUS.OK).json({message: 'Following user now'})
  }
  private userData(user:IUserDocument):IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    }
  }
}
