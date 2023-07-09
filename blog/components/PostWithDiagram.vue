<template>
  <div class="diagram-post-wrapper">
    <transition
      name="diagram-collapse"
      v-on:before-enter="beforeEnter"
      v-on:before-leave="beforeLeave"
    >
      <Content slot-key="diagram" v-show="isOpen" />
    </transition>
    <div class="diagram-controller">
      <Switches v-model="isOpen" theme="custom" color="default" type-bold="true" />
    </div>
    <Post />
  </div>
</template>

<script>
import Post from "@vuepress/theme-blog/layouts/Post";
import Switches from "vue-switches";
export default {
  name: "PostWithDiagram",
  data() {
    return {
      isOpen: false,
      contentWrapper: null,
      toc: null
    };
  },
  components: { Post, Switches },
  mounted() {
    this.contentWrapper = document.querySelector(".content-wrapper");
    this.contentWrapper.classList.add("with-diagram");
    this.toc = document.querySelector(".vuepress-toc");
  },
  beforeDestroy() {
    this.contentWrapper.classList.remove("with-diagram");
    this.contentWrapper.classList.remove("enter");
    this.toc.style.display = "";
  },
  methods: {
    beforeEnter: function(el) {
      this.contentWrapper.classList.add("enter");
      this.toc.style.display = "none";
    },
    beforeLeave: function(el) {
      this.contentWrapper.classList.remove("enter");
      this.toc.style.display = "";
    }
  }
};
</script>

<style lang="stylus">
.content__diagram
  position fixed
  top 80px
  left 0
  width 720px
  max-width 100%
  height calc(100vh - 80px)
  overflow auto
  background-color #fff
  z-index 5

  img
    width 100%

.diagram-controller
  cursor pointer
  position fixed
  top 8px
  left 50%
  z-index 12
  padding 5px
  transform translateX(-50%) translateY(50%)
  transition left 1s

@media (max-width: $MQMobile)
  .content__diagram
    top 62px
    height calc(100vh - 62px)

  .diagram-controller
    top 0

// transition
.diagram-collapse-enter-active, .diagram-collapse-leave-active
  transition all 1s

.diagram-collapse-enter
  left -720px
  opacity 0

.diagram-collapse-leave-to
  opacity 0
  left -720px

@media (min-width: $MQMobile)
  .content-wrapper.with-diagram
    transition padding 1s

    &.enter
      padding-left 720px

// switcher
&.vue-switcher-color--default
  div
    background-color $accentColor

    &:after
      // for the circle on the switch
      background-color white

  &.vue-switcher--unchecked
    div
      background-color $textColor

      &:after
        background-color white
</style>