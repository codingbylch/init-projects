<template>
  <ul class="user">
    <li class="user-item">users</li>
    <li class="user-item"></li>
    <li class="user-item"></li>
    <li class="user-item"></li>
  </ul>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import axios from "../utils/axios"

export default defineComponent({
  setup() {
    axios
      .get("/users/codingbylch")
      .then((res) => {
        console.log("res: ", res)
      })
      .catch((err) => {
        console.log("err: ", err)
      })
  }
})
</script>

<style lang="stylus" scoped>
.user {
  background-color: red;
}
</style>
