<template>
  <div class="home">
    12345
    <div ref="graph"></div>
    <!-- <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import {Graph} from '@packages/graph-lib/index.js'

import { startCase, camelCase, upperCase, snakeCase, words } from 'lodash-es'

let s = 'foo-b aZr'
debugger
console.log('----------', words('ZAaPZaAaaZZZZZZZZZZZZ'))
// console.log(startCase('foo-b ar').replace(/ /g, ''))
console.log(startCase('ZAaPZaAaaZZZZZZZZZZZZ'))

export default {
  name: 'HomeView',
  components: {
    // HelloWorld
  },
  mounted() {
    const graph = new Graph({
      container: this.$refs.graph,
    })
    
  }
}
</script>
