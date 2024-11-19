<template>
  <div>
    <h2>Publicaciones</h2>
    <div v-for="post in posts" :key="post.id">
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
      <p><strong>Publicado por: {{ post.authorEmail }}</strong></p>
      <div>
        <textarea v-model="newComment[post.id]" placeholder="Escribe un comentario..."></textarea>
        <button @click="addComment(post.id)">Comentar</button>
        <div v-for="comment in post.comments" :key="comment.id">
          <p>{{ comment.authorEmail }}: {{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default {
  data() {
    return { posts: [], newComment: {} };
  },
  mounted() {
    const postsCollection = collection(db, 'posts');
    onSnapshot(postsCollection, (snapshot) => {
      this.posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        comments: [],
      }));

      this.posts.forEach((post) => {
        const commentsCollection = collection(db, `posts/${post.id}/comments`);
        onSnapshot(commentsCollection, (snapshot) => {
          post.comments = snapshot.docs.map((doc) => doc.data());
        });
      });
    });
  },
  methods: {
    async addComment(postId) {
      const user = auth.currentUser;
      if (!user) return alert('Inicia sesión para comentar.');
      const commentsCollection = collection(db, `posts/${postId}/comments`);
      await addDoc(commentsCollection, {
        authorEmail: user.email,
        content: this.newComment[postId],
        timestamp: new Date(),
      });
      this.newComment[postId] = '';
    },
  },
};
</script>
