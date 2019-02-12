<template>
    <div class="blog-article">
        <transition name="alert-fade">
            <operator-modal v-if="folderAlert"
                            v-on:deleteBlogAlertOK="deleteBlogAlertOK"
                            v-on:deleteBlogAlertCancel="deleteBlogAlertCancel"
                            :width="alertWidth"
                            :alertTitle="alertTitle"
                            :alertCallBackName="alertCallBackName"
            >
                <template slot="content">
                    <div class="content" style="color:#34ff7a">确定删除?</div>
                </template>
            </operator-modal>
        </transition>
        <div class="blog-article-barrier" v-if="readOrEdit.blog">
            <read-blog v-if="readOrEdit.isReadable"
                       :readOrEdit = "readOrEdit"
                       v-on:goBack = "goBack"
                       v-on:deleteBlog="deleteBlog"
            ></read-blog>
            <edit-blog v-if="readOrEdit.isEditable" :readOrEdit = "readOrEdit" v-on:goBack = "goBack" ></edit-blog>
        </div>
    </div>
</template>

<script>
    import ReadBlog from "./ReadBlog"
    import EditBlog from "./EditBlog"
    import EventHub from "../../../utils/EventHub"
    import OperatorModal from '../../modal/OperatorModal'
    import Utils from "../../../utils/Utils";
    import BlogService from "../../../indexDB/service/BlogService";

    export default {
        name: "BlogArticle",
        components:{
          ReadBlog,
          EditBlog,
          OperatorModal
        },
        data(){
            return {
                readOrEdit:{
                    isReadable:false,
                    isEditable:true,
                    isEdited:"NO_MODIFIED",
                    currentPage:1,
                    blog:{},
                },
                folderAlert:false,
                alertWidth:"150",
                alertTitle:"删除blog",
                alertCallBackName:['deleteBlogAlertOK','deleteBlogAlertCancel'],
                operatorBlog:null,
            }
        },
        mounted(){
           this.findSearchPage();
           // var myPos = EventHub.blogs[this.readOrEdit.blog];
           // if(myPos)
           //   EventHub.pageInfo.current = Math.ceil((myPos+1)/EventHub.pageInfo.pagenum);
        },
        computed:{

        },
        methods:{
            goBack(){
                this.$router.push('/blog/preview_list/'+EventHub.pageInfo.current)
            },
            deleteBlog(blog){
                this.operatorBlog = blog;
                this.folderAlert = true;
            },
            deleteBlogAlertOK(){
                /*** Persistence Data ***/
                BlogService.deleteBlog(this.readOrEdit.blog.id,{successful:"删除日志成功!",unsuccessful:"删除日志失败!"});

                var tags = this.readOrEdit.blog.tags;
                for (let i = 0; i < tags.length; i++) {
                    EventHub.putBlogTag(tags[i],false);
                }
                EventHub.makeBlogTags();
                BlogService.putBlogTags(EventHub.blogTagMap);
                /*** Persistence Data ***/

                /*********************** VIEW ************************/
                if(this.operatorBlog.id){
                    var myPos = -1;
                    for (let i = 0; i < EventHub.blogs.length; i++) {
                        if(this.operatorBlog.id === EventHub.blogs[i].id){
                            myPos = i;
                            break;
                        }
                    }
                    this.deletedBlogById(this.operatorBlog.id);
                    var nextBlog = EventHub.blogs[myPos] >-1 ? EventHub.blogs[myPos] : EventHub.blogs[myPos - 1];
                    this.readOrEdit.blog = nextBlog;
                }
                /*********************** VIEW ************************/

                this.folderAlert = false;
            },

            deleteBlogAlertCancel(){
                this.folderAlert = false;
            },
            deletedBlogById(id){
                var blogs = EventHub.blogs;
                for (let i = 0; i < blogs.length; i++) {
                    if(blogs[i].id === id){
                        //删除列表中的日志
                        blogs.splice(i,1);
                    }
                }
            },

            findSearchPage(){
                this.readOrEdit.isReadable = this.$route.params.isReadable;
                this.readOrEdit.isEditable = !this.readOrEdit.isReadable;
                var id = this.$route.params.id;
                this.getBlogById(id);
            },

            getBlogById(id){
                var that = this;
                BlogService.getBlogById(id).then(function (blog) {
                    BlogService.getBlogContentById(id).then(function (blogContent) {
                        if(blogContent)
                            blog.htmlContent = blogContent.htmlContent;
                        that.readOrEdit.blog = blog;
                        EventHub.$emit('loadBlogCompleted',that.readOrEdit.blog);
                    });
                });
            },
        },
        watch:{
            '$route.params':function() {
                this.findSearchPage();
                window.scrollTo(0, 0);
            }
        },

    }
</script>

<style>
    .blog-article-barrier{
        /*flex: 1;*/
        width: 90%;
        height: 100%;
        margin: 0 auto;

        border-top-left-radius: 0.3rem;
        border-top-right-radius: 0.3rem;
        font-family:STKaiti,LiSu,STXinwei;
    }
    .blog-article-barrier button{
        padding: 7px 15px;
        background-color: #ff3543;
        opacity: 0.8;
        margin-left: 10px;
        color: whitesmoke;
    }
    .blog-article-barrier .more-info{
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.7;
        height: 30px;
    }
    .blog-article-barrier  .more-info .date,
    .blog-article-barrier  .more-info .author
    {
        max-width: 150px;
        font-size: 12px;
        text-align: right;
        margin-right: 8px;
    }
    .blog-article-barrier  .more-info .tags{
        max-width: 200px;
        font-size: 12px;
        text-align: right;
        margin-right: 8px;
    }
    .blog-article-barrier .more-info i{
        margin-right: 5px;
    }
    .blog-article-barrier .more-info .tags span{
        margin: 0 1px;
        border-radius: 3px;
        display: inline-block;
    }
    .ql-toolbar.ql-snow{
        position: sticky;
        top: 60px!important;
        background-color: #f5f5f5;
        z-index: 10;
    }
    .ql-snow .ql-editor pre.ql-syntax {
        background-color: #23241f;
        color: #47e0ff;
        overflow: visible;
    }
    .blog-article-barrier .go-back button{
        border-radius: 5px;
        background-color: #24b95c;
        border-width: 0;
        margin-top: 10px;
        padding: 5px 10px;
    }
    .blog-article-barrier .go-back button:hover{
        cursor: pointer;
    }

</style>
