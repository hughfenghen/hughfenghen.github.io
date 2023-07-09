<template>
  <div class="start">
    <router-link to="/en/">Get Started~</router-link>
  </div>
</template>

<style lang="stylus" scoped>
.start
  margin 50px 0

  > a
    text-decoration none
    font-size 1.2rem
    border 1px solid
    padding 0.8rem 1.6rem
    border-radius 4px
    transition 0.1s ease
    box-sizing border-box

  @media (max-width: $MQMobile)
    display flex
    justify-content center

p
  font-size 20px

@media (max-width: $MQMobile)
  .beginning
    margin-top 0 !important
    text-align center
</style>
