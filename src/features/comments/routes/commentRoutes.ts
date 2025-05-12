import { Get } from '@comment/controllers/get-comments';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
class CommentsRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, Get.prototype.comment);
    this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthentication, Get.prototype.commentNamesFromCache);
    this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthentication, Get.prototype.commentNamesFromCache);

    return this.router;
  }
}
export const commentsRoute: CommentsRoute = new CommentsRoute();
