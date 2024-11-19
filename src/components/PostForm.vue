<template>
  <div>
    <h2>Crear Publicación</h2>
    <form @submit.prevent="createPost">
      <input v-model="title" placeholder="Título" required />
      <textarea v-model="content" placeholder="Contenido" required></textarea>

      <input type="file" @change="handleImageUpload" />

      <button type="submit" class="btn-primary">Publicar</button>
    </form>
  </div>
</template>

<script>
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default {
  data() {
    return {
      title: '',
      content: '',
      image: null,
      imageUrl: '',
    };
  },
  methods: {
    // Manejar la carga de la imagen
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.image = file;
      }
    },

    // Crear una nueva publicación en Firestore
    async createPost() {
      const user = auth.currentUser;
      if (!user) {
        return alert('Inicia sesión para publicar.');
      }

      if (this.image) {
        const storageRef = ref(storage, `images/${this.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, this.image);

        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            alert('Error al subir la imagen: ' + error.message);
          },
          async () => {
            this.imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            this.savePost(user);
          }
        );
      } else {
        this.savePost(user);
      }
    },

    // Guardar la publicación en Firestore
    async savePost(user) {
      try {
        const postData = {
          title: this.title,
          content: this.content,
          authorEmail: user.email,
          timestamp: new Date(),
        };

        if (this.imageUrl) {
          postData.imageUrl = this.imageUrl;
        }

        await addDoc(collection(db, 'posts'), postData);

        // Limpiar los campos del formulario
        this.title = '';
        this.content = '';
        this.image = null;
        this.imageUrl = ''; // Limpiar la URL de la imagen
        alert('Publicación creada');
        this.$router.push('/posts');
      } catch (error) {
        alert('Error al crear la publicación: ' + error.message);
      }
    },
  },
};
</script>
