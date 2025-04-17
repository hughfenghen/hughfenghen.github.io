<template>
  <div id="relation-posts">
    <h2 v-if="relationPages.length > 0">相关文章</h2>
    <div class="relation-posts" itemscope itemtype="http://schema.org/Blog">
      <article
        v-for="page in relationPages"
        :key="page.key"
        class="relation-post"
        itemprop="blogPost"
        itemscope
        itemtype="https://schema.org/BlogPosting"
      >
        <meta itemprop="mainEntityOfPage" :content="page.path" />

        <header class="relation-post-title" itemprop="name headline">
          <NavLink :link="page.path">{{ page.title }}</NavLink>
        </header>

        <client-only v-if="page.excerpt">
          <!-- eslint-disable vue/no-v-html -->
          <p
            class="relation-post-summary"
            itemprop="description"
            v-html="page.excerpt"
          />
          <!-- eslint-enable vue/no-v-html -->
        </client-only>
        <p v-else class="relation-post-summary" itemprop="description">
          {{ page.frontmatter.summary || page.summary }}
        </p>
      </article>
    </div>
  </div>
</template>

<script>
// fork from @vuepress/theme-blog BaseListLayout.vue
import dayjs from 'dayjs'

export default {
  name: 'RelationPost',
  data() {
    return {
      relationPages: [],
    }
  },
  created() {
    const pages = this.$vuepress.$get('siteData').pages
    const post = pages.find(p => p.key === this.$route.name)
    if (!post) return
    const firstTag = post.frontmatter.tags && post.frontmatter.tags[0]
    if (!firstTag) return
    this.relationPages = pages
      .filter(p => p.key !== post.key && p.frontmatter.tags && p.frontmatter.tags.includes(firstTag))
      .sort((a,b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date)).slice(0, 10)
  },
  methods: {
    resolvePostDate(date) {
        return dayjs
          .utc(date)
          .format(this.$themeConfig.dateFormat || 'ddd MMM DD YYYY')
      },
      resolvePostTags(tags) {
        if (!tags || Array.isArray(tags)) return tags
        return [tags]
      },
  },
}
</script>

<style lang="stylus">
.relation-post
  margin-bottom 14px
  border-bottom 1px solid $borderColor

  &:last-child
    border-bottom 0px
    margin-bottom 0px

.relation-post-title
  font-family PT Serif, Serif
  font-size 24px
  border-bottom 0

  a
    cursor pointer
    color $darkTextColor
    transition all 0.2s
    text-decoration none

    &:hover
      text-decoration underline

.relation-post-summary
  font-size 14px
  color rgba($darkTextColor, 0.54)
  font-weight 200
</style>