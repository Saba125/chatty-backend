import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import {  IFollowerData } from '@follower/interfaces/followers.interface';
import HTTP_STATUS from "http-status-codes"
import { followerService } from '@service/db/follower.service';
const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();
export class Get {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees:IFollowerData[] = await followerCache.getFollowersFromCache(`following:${req.currentUser!.userId}`);
    const following:  IFollowerData[] = cachedFollowees.length ? cachedFollowees : await followerService.getFolloweeData(userObjectId);
    res.status(HTTP_STATUS.OK).json({message: 'User following', following})
  }
  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers:IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${req.currentUser!.userId}`);
    const followers:  IFollowerData[] = cachedFollowers.length ? cachedFollowers : await followerService.getFollowerData(userObjectId);
    res.status(HTTP_STATUS.OK).json({message: 'User followers', followers})
  }
}
