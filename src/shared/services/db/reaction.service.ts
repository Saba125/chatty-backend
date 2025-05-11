import { IPostDocument } from '@root/features/posts/interfaces/post.interface';
import { PostModel } from '@root/features/posts/models/post.schema';
import { IQueryReaction, IReaction, IReactionDocument, IReactionJob } from '@root/features/reactions/interfaces/reactions.interface';
import { ReactionModel } from '@root/features/reactions/models/reactions.models';
import { IUserDocument } from '@root/features/user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import mongoose, { UpdateWriteOpResult } from 'mongoose';
import { omit } from 'lodash';
import { Helpers } from '@global/helpers/helpers';
const userCache: UserCache = new UserCache();
class ReactionService {
  public async addReactionDataToDB(reactionData: IReactionJob) {
    const { postId, previousReaction, username, reactionObject, type, userFrom, userTo } = reactionData;
    let updatedReactionObject: any = reactionObject as IReactionDocument;
    if (previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }
    const updatedReaction: [IUserDocument | null, UpdateWriteOpResult, IPostDocument | null] = await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        {
          _id: postId
        },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ]);

    // send reactions notification
  }
  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne(
        {
          _id: postId
        },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        }
      )
    ]);
  }
  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
    return [reactions, reactions.length];
  }
  public async getSinglePostReactionByUsername(postId: string, username: string): Promise<[IReactionDocument[], number] | []> {
    const reactions: any = await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username) } }
    ]);
    return reactions.length ? [reactions[0], 1] : [];
  }
  public async getReactionsByUsername(username: string): Promise<IReactionDocument[] | []> {
    const reactions: any = await ReactionModel.aggregate([{ $match: { username: Helpers.firstLetterUppercase(username) } }]);
    return reactions.length ? [reactions[0], 1] : [];
  }
}
export const reactionService: ReactionService = new ReactionService();
