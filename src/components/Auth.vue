<template>
  <div>
    <h2>Autenticación</h2>
    <form @submit.prevent="handleLogin">
      <label for="email">Correo electrónico</label>
      <input v-model="email" type="email" placeholder="Email" required />
      <label for="password">Contraseña</label>
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <div class="d-flex">
        <button type="submit" class="btn-primary">Iniciar Sesión</button>
        <button @click.prevent="handleRegister" class="btn-secondary">Registrar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default {
  data() {
    return { email: '', password: '' };
  },
  methods: {
    async handleRegister() {
      try {
        await createUserWithEmailAndPassword(auth, this.email, this.password);
        alert('Registro exitoso');
      } catch (error) {
        alert(error.message);
      }
    },
    async handleLogin() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        alert('Inicio de sesión exitoso');
        this.$router.push('/profile');
      } catch (error) {
        alert(error.message);
      }
    },
  }

};
</script>
