<template>
    <header>
      <nav class="navbar">
        <ul class="nav-links" v-if="userLoggedIn">
          <li><router-link to="/posts" class="nav-link">Publicaciones</router-link></li>
          <li><router-link to="/create" class="nav-link">Crear Publicación</router-link></li>
          <li><router-link to="/profile" class="nav-link">Mi Perfil</router-link></li>
          <li>
            <button @click="logout" class="logout-button">Cerrar sesión</button>
          </li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script>
  import { auth } from '../firebase';
  import { signOut, onAuthStateChanged } from 'firebase/auth';
  
  export default {
    data() {
      return {
        userLoggedIn: false, 
      };
    },
    mounted() {
      onAuthStateChanged(auth, (user) => {
        this.userLoggedIn = user !== null;
      });
    },
    methods: {
      async logout() {
        try {
          await signOut(auth);
          alert('Sesión cerrada correctamente');
          this.$router.push('/');
          this.userLoggedIn = false; 
        } catch (error) {
          alert('Error al cerrar sesión: ' + error.message);
        }
      },
    },
  };
  </script>