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

        <div>
          <label for="postImage">Imagen de la publicación</label>
          <input type="file" id="postImage" @change="(event) => handleImageUpload(post, event)" />
        </div>
      </div>

      <div v-else>
        <h3>{{ post.title }}</h3>
        <div v-if="post.imageBase64">
          <img :src="post.imageBase64" alt="Imagen de publicación" class="post-image" />
        </div>
        <p class="m-top">{{ post.content }}</p>
      </div>

      <p><strong>Publicado por: {{ post.authorEmail }}</strong></p>

      <div class="m-top">
        <button v-if="!post.isEditing && post.authorEmail === userEmail" @click="startEditing(post)"
          class="btn-primary">Editar</button>
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
import { collection, doc, getDoc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';
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
        imageBase64: doc.data().imageBase64 || '',
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
      // Actualizar solo si se cambian los datos
      await this.updatePost(post);
    },

    // Actualizar el post en Firestore
    async updatePost(post) {
      const postRef = doc(db, 'posts', post.id);

      // Crear objeto para actualizar datos
      const updatedData = {
        title: post.title,
        content: post.content,
      };

      if (post.imageBase64) {
        updatedData.imageBase64 = post.imageBase64;
      }

      try {
        await updateDoc(postRef, updatedData);
        post.isEditing = false;
      } catch (error) {
        alert('Error al guardar los cambios: ' + error.message);
      }
    },

    // Manejar la carga de imágenes
    handleImageUpload(post, event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          post.imageBase64 = reader.result;
        };
        reader.readAsDataURL(file);
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

<style scoped>
img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 10px;
}
</style>
