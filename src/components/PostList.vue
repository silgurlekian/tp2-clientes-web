<template>
  <div>
    <h2>Publicaciones</h2>
    <div v-for="post in posts" :key="post.id" class="border-bottom">
      <div v-if="post.isEditing">
        <h3>
          <input v-model="post.title" placeholder="Título del post" />
        </h3>
        <p>
          <textarea v-model="post.content" placeholder="Contenido del post"></textarea>
        </p>
      </div>

      <div v-else>
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
      </div>

      <!-- Información adicional -->
      <p><strong>Publicado por: {{ post.authorEmail }}</strong></p>

      <div class="m-top">
        <!-- El botón de editar solo aparece si el usuario es el autor del post -->
        <button v-if="!post.isEditing && post.authorEmail === userEmail" @click="startEditing(post)" class="btn-primary">Editar</button>
        <button v-if="post.isEditing" @click="savePost(post)" class="btn-primary">Guardar</button>
      </div>

      <!-- Comentarios -->
      <div class="m-top">
        <p><strong>Comentarios:</strong></p>
        <textarea v-model="newComment[post.id]" placeholder="Escribe un comentario..."></textarea>
        <button @click="addComment(post.id)" class="btn-secondary">Comentar</button>
        <div v-for="comment in post.comments" :key="comment.id" class="m-top">
          <p>{{ comment.authorEmail }}: {{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default {
  data() {
    return {
      posts: [],
      newComment: {},
      userEmail: null, 
    };
  },
  mounted() {
    if (auth.currentUser) {
      this.userEmail = auth.currentUser.email;
    }

    const postsCollection = collection(db, 'posts');
    onSnapshot(postsCollection, (snapshot) => {
      this.posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        comments: [],
        isEditing: false, 
      }));

      // Obtener los comentarios de cada post
      this.posts.forEach((post) => {
        const commentsCollection = collection(db, `posts/${post.id}/comments`);
        onSnapshot(commentsCollection, (snapshot) => {
          post.comments = snapshot.docs.map((doc) => doc.data());
        });
      });
    });
  },
  methods: {
    // Iniciar el modo de edición
    startEditing(post) {
      post.isEditing = true;
    },

    // Guardar los cambios del post
    async savePost(post) {
      const postRef = doc(db, 'posts', post.id);
      try {
        await updateDoc(postRef, {
          title: post.title,
          content: post.content,
        });
        post.isEditing = false; 
      } catch (error) {
        alert('Error al guardar los cambios: ' + error.message);
      }
    },

    // Agregar un comentario
    async addComment(postId) {
      const user = auth.currentUser;
      if (!user) return alert('Inicia sesión para comentar.');

      try {
        const commentsCollection = collection(db, `posts/${postId}/comments`);
        await addDoc(commentsCollection, {
          authorEmail: user.email,
          content: this.newComment[postId],
          timestamp: new Date(),
        });
        this.newComment[postId] = '';
      } catch (error) {
        alert('Error al agregar el comentario: ' + error.message);
      }
    },
  },
};
</script>
