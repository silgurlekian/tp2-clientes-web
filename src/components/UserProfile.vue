<template>
  <div v-if="email">
    <h2>Perfil de Usuario</h2>
    <p>Email: {{ email }}</p>

    <div>
      <h3>Actualizar Perfil</h3>

      <div>
        <label for="currentPassword">Contraseña actual</label>
        <input type="password" id="currentPassword" v-model="currentPassword" placeholder="Contraseña actual"
          required />

        <label for="newPassword">Nueva contraseña</label>
        <input type="password" id="newPassword" v-model="newPassword" placeholder="Nueva contraseña" />
      </div>

      <div>
        <label for="profileImage">Imagen de perfil</label>
        <input type="file" id="profileImage" @change="handleImageUpload" />
      </div>

      <div v-if="profileImageUrl">
        <img :src="profileImageUrl" alt="Imagen de perfil" class="profile-image" />
      </div>

      <button @click="updateProfile" class="btn-primary">Guardar cambios</button>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebase';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      currentPassword: '',
      newPassword: '',
      profileImageUrl: '',
    };
  },
  async mounted() {
    const user = auth.currentUser;
    if (user) {
      this.email = user.email;

      // Cargar la URL de la imagen de perfil desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        this.profileImageUrl = userDoc.data().profileImageUrl || '';
      }
    }
  },
  methods: {
    // Manejar la carga de la imagen y convertirla a Base64
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.profileImageUrl = reader.result; // Convertir la imagen a Base64
        };
        reader.readAsDataURL(file);
      }
    },

    // Actualizar el perfil del usuario
    async updateProfile() {
      const user = auth.currentUser;

      if (!user) {
        alert('Usuario no autenticado');
        return;
      }

      // Reautenticar al usuario si es necesario
      if (this.currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email, this.currentPassword);
          await reauthenticateWithCredential(user, credential);
        } catch (error) {
          alert('Error al reautenticar: ' + error.message);
          return;
        }
      } else {
        alert('Por favor, ingresa tu contraseña actual.');
        return;
      }

      // Cambiar la contraseña si se proporciona una nueva
      if (this.newPassword) {
        try {
          await updatePassword(user, this.newPassword);
          alert('Contraseña actualizada correctamente');
        } catch (error) {
          alert('Error al actualizar la contraseña: ' + error.message);
        }
      }

      // Actualizar el perfil en Firestore
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          { profileImageUrl: this.profileImageUrl },
          { merge: true }
        );
        alert('Perfil actualizado correctamente');
      } catch (error) {
        alert('Error al guardar los cambios: ' + error.message);
      }
    },
  },
};
</script>

<style scoped>
.profile-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ccc;
}
</style>
