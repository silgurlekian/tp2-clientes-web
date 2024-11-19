<template>
  <div>
    <h2>Crear Publicación</h2>
    <form @submit.prevent="createPost">
      <input v-model="title" placeholder="Título" required />
      <textarea v-model="content" placeholder="Contenido" required></textarea>

      <div>
        <label for="imageInput">Seleccionar Imagen</label>
        <input type="file" id="imageInput" @change="handleImageUpload" />
        <div v-if="imageBase64" class="preview">
          <img :src="imageBase64" alt="Vista previa de la imagen" />
        </div>
      </div>

      <button type="submit" class="btn-primary">Publicar</button>
    </form>
  </div>
</template>

<script>
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default {
  data() {
    return {
      title: '',
      content: '',
      imageBase64: '', // Almacena la imagen en Base64 para la publicación
    };
  },
  methods: {
    // Manejar la carga de la imagen
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imageBase64 = reader.result; // Convierte la imagen a Base64
        };
        reader.readAsDataURL(file);
      }
    },

    // Crear una nueva publicación
    async createPost() {
      const user = auth.currentUser;

      if (!user) {
        alert('Inicia sesión para publicar.');
        return;
      }

      // Datos de la nueva publicación
      const postData = {
        title: this.title.trim(),
        content: this.content.trim(),
        imageBase64: this.imageBase64 || '', 
        authorEmail: user.email,
        createdAt: new Date(),
      };

      try {
        // Guardar el post en Firestore
        const postRef = collection(db, 'posts');
        await addDoc(postRef, postData);

        // Limpiar el formulario
        this.title = '';
        this.content = '';
        this.imageBase64 = '';
        alert('Publicación creada con éxito');
        this.$router.push('/posts'); // Redirigir al listado de publicaciones
      } catch (error) {
        alert('Error al crear la publicación: ' + error.message);
      }
    },
  },
};
</script>

<style scoped>
.preview img {
  max-width: 100%;
  max-height: 200px;
  margin-top: 10px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
