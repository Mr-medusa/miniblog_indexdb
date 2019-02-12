<template>
    <div class="catalog-bar">
        <!--文件夹弹出框-->
        <transition name="alert-fade">
            <operator-modal v-if="folderAlert"
                            v-on:createBlogAlertOK="createBlogAlertOK"
                            v-on:createBlogAlertCancel="createBlogAlertCancel"
                            :width="alertWidth"
                            :alertTitle="alertTitle"
                            :alertCallBackName="alertCallBackName"
            >
                <template slot="content">
                    <component v-bind:is="alertComponent"
                               v-model="blog"
                               :alertMsg="alertMsg"
                               :blog="blog"
                    >
                    </component>
                </template>
            </operator-modal>
        </transition>
        <div class="catalog-barrier">
            <div class="header" id="catalog-barrier-tags">
                <div class="folding-tags">
                    <input type="checkbox" v-model="isShowTags" name="sex" id="male" class="chooseBtn" />
                    <label for="male" class="choose-label"></label>
                </div>
                <transition name="my-tags">
                    <div class="my-tags" v-if="isShowTags">
                        <span v-for="tag in blogTags" :class="{'check-tag':findCheckTagsState(tag)}" @click="searchBlogByTag(tag)">{{tag}}</span>
                    </div>
                </transition>
            </div>
            <div>
                <ul class="catalog-operator">
                    <li id="add-blog">
                        <span class="new-file hvr-wobble-top" @click="createBlogAlert"><i class="fa fa-plus-circle" aria-hidden="true"></i></span>
                    </li>
                </ul>
            </div>
            <div id="my-catalog-scroll">
                <ul class="my-catalog">
                    <li v-for="blog in blogList" @click="readBlog(blog)">
                        <div class="title word-ellipsis"><a href="javascript:;">#{{blog.title}}</a></div>
                        <div class="date-and-tag">
                            <div class="time"><i class="fa fa-calendar" aria-hidden="true"></i><span>{{blog.updateTime | dateToLocalTime}}</span></div>
                            <div class="tag word-ellipsis"><i class="fa fa-tags" aria-hidden="true"></i>
                                <span v-for="tag in blog.tags">#{{tag}}</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import operatorModal from '../../components/modal/OperatorModal'
    import updateBlogModal from '../../components/modal/UpdateBlogModal'
    import EventHub from '../../utils/EventHub'
    import Utils from '../../utils/Utils'
    import BlogService from "../../indexDB/service/BlogService"

    export default {
        name: "CatalogBar",
        components:{
            operatorModal,
            updateBlogModal
        },
        data(){
            return{
                isShowTags:true,
                blogList : EventHub.blogs,          /*日志列表*/
                blogTags: EventHub.blogTags,

                checkTagsState:null,

                folderAlert:false,
                alertWidth:"300",
                blogName:null,
                alertComponent:null,
                alertMsg:null,
                blog:{
                    blogName:"",
                    blogTag:"",
                },
            }
        },
        mounted(){
            Utils.makeScrollBar("#catalog-barrier-tags",{scrollInertia: 300, deltaFactor: 100, axis: "y"});
            Utils.makeScrollBar("#my-catalog-scroll",{scrollInertia: 300, deltaFactor: 100, axis: "y"});
        },
        methods:{
            createBlogAlert() {
                this.blog = {
                    title:"",
                    tags:"",
                };
                this.alertTitle = "新建日志";
                this.alertComponent = 'updateBlogModal';
                this.alertWidth = 300;
                this.alertCallBackName = ['createBlogAlertOK', 'createBlogAlertCancel'];
                this.folderAlert = true;
            },
            createBlogAlertOK() {
                var blogName,blogTags;
                if(!this.blog.title || !this.blog.title.trim()){
                    blogName = "untitled";
                }else{
                    blogName = this.blog.title.trim();
                }

                var myTags = [];
                if(this.blog.tags && this.blog.tags.trim()){
                    blogTags = this.blog.tags.trim().split(" ");
                    blogTags = Utils.removeDuplicate(blogTags);
                    for (let i = 0; i < blogTags.length; i++) {
                        if(blogTags[i].trim()){
                            myTags.push(blogTags[i].trim());
                            EventHub.putBlogTag(blogTags[i]);
                        }
                    }
                   EventHub.makeBlogTags()
                }

                var newBlog = this.newBlog(blogName,myTags);

                EventHub.blogs.splice(0,0,newBlog);

                this.folderAlert = false;
                /*** Persistence Data ***/
                var that = this;
                BlogService.putBlogAndTags(newBlog,
                    {
                        id:newBlog.id,
                        title:newBlog.title,
                        updateTime:newBlog.updateTime,
                        tags:myTags.join(" "),
                        isShowBanner:newBlog.isShowBanner,
                    },EventHub.blogTagMap,{successful:"添加日志成功!",unsuccessful:"添加日志失败!"
                }).then(function () {
                    that.$router.push({ name: 'blogArticle', params: {id: newBlog.id, isReadable: false }});
                });
                /*** Persistence Data ***/
            },
            createBlogAlertCancel() {
                this.folderAlert = false;
            },
            readBlog(blog){
                this.$router.push({ name: 'blogArticle', params: { id: blog.id, isReadable: true }});
            },
            newBlog(blogName,blogTags){
                return {
                    id: Utils.UUID2(8,16),
                    title:blogName,
                    tags:blogTags,
                    isShowBanner:true,
                    createTime:new Date(),
                    updateTime:new Date(),
                }
            },

            /*********************** 搜索过滤 START********************************/
            findCheckTagsState(tag){
                return this.checkTagsState === tag;
            },
            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            //++  1.通过标签过滤-直接过滤EventHub.blogs                     ++
            //++  2.通过关键字过滤-查询数据库构建新的-EventHub.blogs        ++
            //++        2.1 在关键字过滤时期如果还有通过标签过滤的话-直接使用方式1 ++
            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            searchBlogByTag(tag){
                if(this.checkTagsState){
                    if(this.checkTagsState === tag){        //只做简单的单选功能,这样比较方便操作
                        this.checkTagsState = null;
                        this.blogList = EventHub.blogs;
                        EventHub.changeBlogKeyWord();
                        EventHub.changePageInfo(this.blogList,true);    //回到没有搜索之前的状态
                        EventHub.$emit('initBlogsCompleted');
                        return;
                    }else{
                        this.checkTagsState = tag;
                    }
                }else{
                    this.checkTagsState = tag;
                }
                this.blogList = EventHub.blogs.filter(function (v) {
                    return v.tags.indexOf(tag) > -1;
                });
                EventHub.changePageInfo(this.blogList);                 //改变搜索状态时候的分页信息
                EventHub.changeBlogKeyWord("tag",tag);
                EventHub.$emit('initBlogsCompleted');
            },
            navSearchKey(searchKey){
                if(searchKey && searchKey.trim()){
                    searchKey = searchKey.trim();
                    EventHub.changeBlogKeyWord();
                }else{
                    this.$router.push(`/blog/preview_list/1`);
                }
                var that = this;
                EventHub.blogs.splice(0,EventHub.blogs.length);
                BlogService.getBlogCatalogByKeyword(searchKey,EventHub.blogs).then(function () {
                    EventHub.changePageInfo(EventHub.blogs);
                    EventHub.changeBlogKeyWord("keyword",searchKey);
                    EventHub.$emit('initBlogsCompleted');
                }).catch(function (arr) {
                    console.log(arr);
                    that.$router.push(`/blog/preview_list/1`);
                });
            },
            /*********************** 搜索过滤 END********************************/

            /**********************初始化侧边目录与标签*********************************/
            initData(){
                var that = this;
                BlogService.getBlogCatalog().then(function (data) {
                    if(data && data.length>0){
                        that.blogList = data;
                        EventHub.blogs = data;
                        EventHub.pageInfo.total = data.length;
                    }
                    //初始化右边文章预览列表
                    EventHub.$emit('initBlogsCompleted')
                }).catch(function (err) {
                    console.log(err);
                    EventHub.$emit('goTip',["初始化数据失败!",false])
                });

                BlogService.getBlogTags("blogTags").then(function (data) {
                    if(data && data.tags.length){
                        data.tags.forEach(function (tag) {
                            EventHub.blogTagMap.set(tag[0],tag[1]);
                        });
                        EventHub.makeBlogTags();
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            },
            /**********************初始化侧边目录与标签*********************************/
        },
        created(){
           this.initData();
            EventHub.$on('navSearchKey', this.navSearchKey);
        },
        beforeDestroy: function () {
            EventHub.$off('navSearchKey', this.navSearchKey);
        },
    }
</script>

<style scoped>

    .catalog-bar{
        height: 100%;
        font-size: 18px;
    }
    .catalog-barrier{
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .catalog-barrier .header{
        max-height: 300px;
    }

    .folding-tags{
        text-align: right;
        padding:15px 10px 0 0;
    }
    .folding-tags .chooseBtn {
        display: none;
    }
    .folding-tags .choose-label {
        width: 30px;
        height: 15px;
        display: inline-block;
        border-radius: 15px;
        position: relative;
        background-color: #bdbdbd;
        overflow: hidden;
    }
    .folding-tags .choose-label:hover{
        cursor: pointer;
    }
    .folding-tags .choose-label:before {
        content: '';
        position: absolute;
        left: 0;
        width: 15px;
        height: 15px;
        display: inline-block;
        border-radius: 15px;
        background-color: #ffffff;
        transition: all 0.5s;
    }
    .folding-tags .chooseBtn:checked + label.choose-label:before {
        left: 15px;
    }
    .folding-tags .chooseBtn:checked + label.choose-label {
        background-color: #8cd151;
    }

    .my-tags{
        margin: 10px auto;
        text-align: left;
        padding: 10px;
        box-sizing: border-box;
        user-select: none;
        background-color: rgba(30, 30, 30, 0.76);
        border-radius: 10px;
    }
    .my-tags .check-tag{
        background-color: #ff687c;
    }
    .my-tags span{
        background-color: #309caf;
        border-radius: 5px;
        font-size: 14px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        margin: 3px;
        padding: 0 10px;
        display: inline-block;
    }
    .my-tags span:hover{
        cursor: pointer;
    }

    .catalog-bar ul li{
        text-align: left;
        padding: 0 10px;
        user-select: none;
        height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-bottom: #505050 1px solid;
        box-sizing: border-box;
    }
    .catalog-bar ul li:hover{
        cursor: pointer;
        background-color: rgba(88, 84, 83, 0.69);
    }
    .catalog-bar ul li .title{
        max-height: 30px;
        line-height: 30px;
        box-sizing: border-box;
        color: #dbdbdb;
    }
    .catalog-bar ul li .title a{
        color: #dbdbdb;
    }
    .catalog-bar ul li .date-and-tag{
        max-height: 20px;
        font-size: 12px;
        font-family: sans-serif;
        color: #6d6d6d;
        display: flex;
        justify-content: space-between;
        align-items: center;

    }
    .catalog-bar ul li .date-and-tag .time{
        flex: 1;
    }
    .catalog-bar ul li .date-and-tag .tag{
        flex: 1;
        width: 150px;
        max-width: 150px;
        text-align: left;
    }
    .catalog-bar ul li .date-and-tag .tag i,
    .catalog-bar ul li .date-and-tag .time i{
        margin-right: 5px;
    }
    .catalog-bar ul li .date-and-tag .tag span{
        margin-right: 5px;
    }
    .catalog-bar .catalog-operator li:hover{
        cursor: default;
        background-color: transparent;
    }
    #add-blog{
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-end;
        height: 30px;
        font-size: 23px;
    }
    #add-blog .new-file{
        color: #6d6d6d;
        width: 60px;
        text-align: center;
    }
    #add-blog .new-file:hover{
        cursor: pointer;
        color: #c4c4c4;
    }

    .my-tags-enter-active, .my-tags-leave-active {
        transition: all .5s;
    }
    .my-tags-enter, .my-tags-leave-to{
        opacity: 0;
        transform: translateY(-100%);
    }
    
    #my-catalog-scroll{
        flex: 1;
        box-sizing: border-box;
        overflow: hidden;
    }

</style>
<style>
    .catalog-bar .mCSB_container{
        margin-right: 15px;
    } 
    .catalog-bar .mCSB_dragger .mCSB_dragger_bar{
        background-color: rgba(88, 88, 88, 0.71) !important;
    }
</style>