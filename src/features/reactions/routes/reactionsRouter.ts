import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
import { Add } from '../controllers/add-reactions';
import { Remove } from '../controllers/remove-reactions';
import { Get } from '../controllers/get-reactions';
class ReactionsRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/reactions', authMiddleware.checkAuthentication, Add.prototype.reaction);

    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      Remove.prototype.reaction
    );
    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, Get.prototype.reactions);
    this.router.get('/post/single/reaction/:postId/:username', authMiddleware.checkAuthentication, Get.prototype.singleReactionByUsername);
    this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, Get.prototype.reactionsByUsername);

    return this.router;
  }
}
export const reactionsRoute: ReactionsRoute = new ReactionsRoute();
