<template>
  <div id="vuepress-theme-blog__post-layout">
    <article
      class="vuepress-blog-theme-content"
      itemscope
      itemtype="https://schema.org/BlogPosting"
    >
      <header>
        <PostMeta
          :tags="$frontmatter.tags"
          :author="$frontmatter.author"
          :date="$frontmatter.date"
          :location="$frontmatter.location"
        />
      </header>
      <Content itemprop="articleBody" />
      <footer>
        <Newsletter v-if="$service.email.enabled" />
        <hr />
        <Comment />
      </footer>
    </article>
    <Toc />
    <div>share</div>
  </div>
</template>

<script>
// fork from @vuepress/theme-blog
import Toc from '@vuepress/theme-blog/components/Toc.vue'
import PostMeta from '@vuepress/theme-blog/components/PostMeta.vue'
import Comment from './Comment.vue'

export default {
  components: {
    Toc,
    PostMeta,
    Comment,
    Newsletter: () => import('@vuepress/theme-blog/components/Newsletter.vue'),
  },
}
</script>

<style lang="stylus">
// @require '@vuepress/theme-blog/styles/wrapper.styl'
$wrapper
  max-width $contentWidth
  margin 0 auto
  background-color $bgColor
  @media (min-width: $MQNarrow)
    padding 2rem
  @media (max-width: $MQMobileNarrow)
    padding 1.5rem

.vuepress-blog-theme-content
  @extend $wrapper
  font-size 16px
  letter-spacing 0px
  font-family PT Serif, Serif
  color $textColor
  position relative

  @media (min-width: $MQNarrow)
    box-shadow 0 10px 20px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.07)

  .post-title
    padding-top 0

@media (max-width: $MQMobile)
  .vuepress-blog-theme-content
    padding-top 0

  .post-title
    margin-top 0
</style>
