import { UserModel } from '@root/features/user/models/user.schema';
import mongoose from 'mongoose';
export class BlockUserService {
  public async blockUser(userId:string,followerId: string): Promise<void> {
     UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId, blocked: {$ne:new mongoose.Types.ObjectId(followerId)} },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(followerId)
            }
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId, blockedBy: {$ne:new mongoose.Types.ObjectId(userId)} },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(followerId)
            }
          }
        }
      },
    ]);
  }
  public async unBlockUser(userId:string,followerId: string): Promise<void> {
     UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId)
            }
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId)
            }
          }
        }
      },
    ]);
  }
}
export const blockUserService: BlockUserService = new BlockUserService()
