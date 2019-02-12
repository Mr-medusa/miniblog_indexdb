import db from "../DataSource"

import EventHub from "../../utils/EventHub"
import Blog from "../dao/Blog"
import blogContent from "../dao/BlogConent"
import BlogTags from "../dao/BlogTags"

var blogDao = new Blog();
var blogContentDao = new blogContent();
var blogTagsDao = new BlogTags();

export default {

    getBlogById(id) {
        return blogDao.get(id);
    },
    getBlogContentById(id) {
        return blogContentDao.get(id);
    },

    getBlogCatalog() {
        return blogDao.getAll();
    },

    getBlogCatalogByKeyword(keyword, blogs) {
        return db.blogContent.orderBy("updateTime")
            .reverse()
            .each(function (blog, cursor) {
                if (
                    (blog.title && blog.title.includes(keyword)) ||
                    (blog.author && blog.author.includes(keyword)) ||
                    (blog.tags && blog.tags.includes(keyword)) ||
                    (blog.previewContent && blog.previewContent.includes(keyword)) ||
                    (blog.htmlContent && blog.htmlContent.includes(keyword))
                ) {
                    blogs.push({
                        id: blog.id,
                        title: blog.title,
                        tags: blog.tags.split(" "),
                        updateTime: blog.updateTime,
                        author: blog.author,
                        isShowBanner:blog.isShowBanner,
                    });
                }
            });
    },

    getBlogTags(id) {
        return blogTagsDao.get(id);
    },

    putBlogAndTags(blog, blogContent, tags, res) {
        var that = this;
        return db.transaction("rw", db.blog, db.blogContent, db.blogTags, () => {
            blogDao.put(blog);
            if (blogContent)
                blogContentDao.put(blogContent);
            if (tags)
                that.putBlogTags(tags);
        }).then(() => {
            EventHub.$emit('goTip', [res.successful, true])
        }).catch((err) => {
            console.log(err);
            EventHub.$emit('goTip', [res.unsuccessful, false])
        });
    },

    putBlogTags(tags) {
        var tagArr = [], entry;
        var mapIter = tags.entries();
        while ((entry = mapIter.next().value)) {
            tagArr.push(entry)
        }
        blogTagsDao.put({id: "blogTags", tags: tagArr});
    },

    deleteBlog(id, res) {
        return db.transaction("rw", db.blog, db.blogContent, function () {
            blogDao.delete(id);
            blogContentDao.delete(id);
        }).then(function () {
            EventHub.$emit('goTip', [res.successful, true])
        }).catch(function (arr) {
            console.log(arr);
            EventHub.$emit('goTip', [res.unsuccessful, false])
        });
    }
}

