import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
import { Create } from '../controllers/create-post';
import { GetPost } from '../controllers/get-posts';
import { Delete } from '../controllers/delete-post';
import { Update } from '../controllers/update-post';
class PostRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, GetPost.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, GetPost.prototype.postsWithImages);
    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);
    this.router.post('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);
    return this.router;
  }
}
export const postRoutes: PostRoutes = new PostRoutes();
