<template>
  <div class="share-button" @click="copyShareInfo" title="复制文章链接">
    <transition name="fade" mode="out-in">
      <span v-if="copied" key="copied" class="copied-text">Copied</span>
      <svg v-else key="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Share',
  data() {
    return {
      copied: false,
      timerId: 0
    }
  },
  methods: {
    copyShareInfo() {
      const title = this.$page.title
      const url = window.location.href
      const shareText = `[${title}](${url}) —— 风痕`
      
      navigator.clipboard.writeText(shareText)
        .then(() => {
          this.copied = true
          clearTimeout(this.timerId)
          this.timerId = setTimeout(() => {
            this.copied = false
          }, 2000)
        })
        .catch(err => {
          console.error('复制失败:', err)
          alert('复制失败，请手动复制')
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.share-button
  position: fixed
  bottom: 30px
  right: 30px
  width: 40px
  height: 40px
  border-radius: 50%
  background-color: #d05dd2
  color: white
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
  transition: all 0.3s ease, fadeIn 0.5s ease
  z-index: 100
  -webkit-tap-highlight-color: transparent
  -webkit-touch-callout: none
  
  &:hover
    transform: scale(1.1)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)

.copied-text
  font-size: 10px
  font-weight: bold
  animation: fadeIn 0.5s ease

@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1

@media (max-width: 719px)
  .share-button
    bottom: 20px
    right: 20px

.fade-enter-active, .fade-leave-active
  transition: opacity 0.3s ease

.fade-enter, .fade-leave-to
  opacity: 0
</style>