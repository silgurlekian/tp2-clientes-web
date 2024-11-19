<template>
  <div>
    <h2>Crear Publicación</h2>
    <form @submit.prevent="createPost">
      <input v-model="title" placeholder="Título" required />
      <textarea v-model="content" placeholder="Contenido" required></textarea>
      <button type="submit">Publicar</button>
    </form>
  </div>
</template>

<script>
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default {
  data() {
    return { title: '', content: '' };
  },
  methods: {
    async createPost() {
      const user = auth.currentUser;
      if (!user) return alert('Inicia sesión para publicar.');
      await addDoc(collection(db, 'posts'), {
        title: this.title,
        content: this.content,
        authorEmail: user.email,
        timestamp: new Date(),
      });
      this.title = '';
      this.content = '';
      alert('Publicación creada');
      this.$router.push('/posts');
    },
  },
};
</script>
