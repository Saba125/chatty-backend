import { Add } from '@comment/controllers/add-comment';
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
    this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);

    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comment);
    return this.router;
  }
}
export const commentsRoute: CommentsRoute = new CommentsRoute();
