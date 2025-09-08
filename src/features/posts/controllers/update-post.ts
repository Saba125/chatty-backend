import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post';
import { postQueue } from '@service/queues/post.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema } from '../schemes/post.schemes';
import { IPostDocument } from '../interfaces/post.interface';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
const postCache: PostCache = new PostCache();
export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response) {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    socketIOPostObject.emit('update post', req.params.postId);
    const updatedPost: any = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId,
      imgVersion
    };
    const postUpdated = await postCache.updatePostInCache(req.params.postId, updatedPost);
    postQueue.addPostJob('updatePostFromDB', { key: req.params.postId, value: postUpdated });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated' });
  }
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response) {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePostWithImage(req, res);
    } else {
      const result: UploadApiResponse | UploadApiErrorResponse | undefined = await Update.prototype.addImageToExistingPost(req);
      if (!result?.public_id) {
        throw new BadRequestError(result?.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post image updated  updated' });
  }
  private async updatePostWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    socketIOPostObject.emit('update post', req.params.postId);
    const updatedPost: any = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId,
      imgVersion
    };
    const postUpdated = await postCache.updatePostInCache(req.params.postId, updatedPost);
    postQueue.addPostJob('updatePostFromDB', { key: req.params.postId, value: postUpdated });
    res.status(HTTP_STATUS.OK).json({ message: 'Post with img updated' });
  }
  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
    const result: UploadApiResponse | UploadApiErrorResponse | undefined = await uploads(image);
    if (!result?.public_id) {
      return result;
    }
    socketIOPostObject.emit('update post', req.params.postId);
    const updatedPost: any = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    };
    const postUpdated = await postCache.updatePostInCache(req.params.postId, updatedPost);
    postQueue.addPostJob('updatePostFromDB', { key: req.params.postId, value: postUpdated });
    return result;
  }
}
