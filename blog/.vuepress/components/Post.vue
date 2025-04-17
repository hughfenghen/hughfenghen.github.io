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
        <div class="business-cooperation">💗 博主正处于裸辞待业状态，欢迎 <a href="/posts/2025/04/11/business-cooperation/">商务合作</a> 💗</div>
        <Newsletter v-if="$service.email.enabled" />
        <Comment />
        <hr />
        <RelationPost />
      </footer>
    </article>
    <Toc />
    <Share />
  </div>
</template>

<script>
// fork from @vuepress/theme-blog
import Toc from '@vuepress/theme-blog/components/Toc.vue'
import PostMeta from '@vuepress/theme-blog/components/PostMeta.vue'
import Comment from './Comment.vue'
import Share from './Share.vue'
import RelationPost from './RelationPost.vue'

export default {
  components: {
    Toc,
    PostMeta,
    Comment,
    Share,
    RelationPost,
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

.business-cooperation
  text-align: center
  padding: 1rem 0
  background-color: antiquewhite

@media (max-width: $MQMobile)
  .vuepress-blog-theme-content
    padding-top 0

  .post-title
    margin-top 0
</style>
