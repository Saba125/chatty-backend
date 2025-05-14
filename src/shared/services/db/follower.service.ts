import { IFollowerData } from '@follower/interfaces/followers.interface';
import { FollowerModel } from '@follower/models/followers.model';
import { UserModel } from '@root/features/user/models/user.schema';
import mongoose, { ObjectId, Types } from 'mongoose';
class FollowerService {
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: ObjectId) {
    const followeeObjectId = new mongoose.Types.ObjectId();
    const followerObjectId = new mongoose.Types.ObjectId();
    await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);
    await Promise.all([users, UserModel.findOne({ _id: followeeId })]);
  }
  public async removeFollowerFromDB(followeeId: string, followerId: string) {
    const followeeObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId = new mongoose.Types.ObjectId(followerId);
    const unfollow = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ]);
    await Promise.all([unfollow, users]);
  }
  public async getFolloweeData(userObjectId: Types.ObjectId): Promise<IFollowerData[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
      { $unwind: '$followeeId' },
      { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followeId._id',
          username: `$authId.username`,
          avatarColor: `$authId.avatarColor`,
          uId: `$authId.uId`,
          postCount: `$followeeId.postsCount`,
          followersCount: `$followeeId.followersCount`,
          followingCount: `$followeeId.followingCount`,
          profilePicture: `$followeeId.profilePicture`,
          userProfile: `$followeeId`
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return followee;
  }
  public async getFollowerData(userObjectId: Types.ObjectId): Promise<IFollowerData[]> {
    const follower = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' },
      { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followeId._id',
          username: `$authId.username`,
          avatarColor: `$authId.avatarColor`,
          uId: `$authId.uId`,
          postCount: `$followerId.postsCount`,
          followersCount: `$followerId.followersCount`,
          followingCount: `$followerId.followingCount`,
          profilePicture: `$followerId.profilePicture`,
          userProfile: `$followerId`
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return follower;
  }
}
export const followerService: FollowerService = new FollowerService();
