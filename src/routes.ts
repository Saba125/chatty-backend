import { Application } from 'express';
import { authRoutes } from './features/auth/routes/authRoutes';
import { serverAdapter } from '@service/queues/base.queue';
import { currentUserRoutes } from '@auth/routes/userRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { postRoutes } from './features/posts/routes/postRouter';
import { reactionsRoute } from './features/reactions/routes/reactionsRouter';
import { commentsRoute } from '@comment/routes/commentRoutes';
import { followerRoutes } from '@follower/routes/follower-route';
const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionsRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentsRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
  };
  routes();
};
