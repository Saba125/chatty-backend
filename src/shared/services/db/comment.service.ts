import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comments.models';
import { IPostDocument } from '@root/features/posts/interfaces/post.interface';
import { PostModel } from '@root/features/posts/models/post.schema';
import { IUserDocument } from '@root/features/user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { Query } from 'mongoose';
const userCache: UserCache = new UserCache();
class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { comment, postId, userFrom, userTo, username } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post = PostModel.findOneAndUpdate(
      {
        _id: postId
      },
      { $inc: { commentsCount: 1 } },
      { new: true }
    );
    const user = userCache.getUserFromCache(userTo);
    const response = await Promise.all([comments, post, user]);
    // send comment notification
  }
  public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }
  public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);
    return comments;
  }
}
export const commentService: CommentService = new CommentService();
