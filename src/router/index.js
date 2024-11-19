import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase";
import UserProfile from "../components/UserProfile.vue";
import Auth from "../components/Auth.vue";
import Posts from "../components/PostList.vue";
import Post from "../components/PostForm.vue";

const routes = [
  { path: "/", component: Auth },
  { path: "/posts", component: Posts },
  { path: "/create", component: Post },
  {
    path: "/profile",
    component: UserProfile,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    next("/");
  } else {
    next();
  }
});

export default router;
