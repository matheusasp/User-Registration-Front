<!-- src/App.vue -->
<template>
  <router-view></router-view>
</template>

<style lang="scss">
@import '@/assets/scss/main.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', Arial, sans-serif;
  color: #202124;
  background-color: #f5f7fa;
  line-height: 1.5;
}

a {
  color: #4285f4;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>