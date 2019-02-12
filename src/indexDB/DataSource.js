import EventHub from "../utils/EventHub";
import FrontConfig from "../config/FrontConfig"
import Data from "../utils/Data"

var db = new Dexie(FrontConfig.dbName);

db.version(1).stores({
    pads: '&id',
    pad: '&id',
    blog: '&id,title,tags,updateTime',
    blogContent: "&id,title,tags,htmlContent,updateTime",
    blogTags: '&id',
});

Dexie.exists(FrontConfig.dbName).then(function (exists) {
    if (!exists) {
        db.transaction("rw", db.pads, db.blog, db.blogContent, db.blogTags, () => {
            var tip = true;
            //添加一个默认文件夹(空数据时隐藏)
            db.pads.count().then(function (count) {
                if (count === 0) {
                    db.pads.add(EventHub.folderRoot);
                    EventHub.$emit('goTip', ["初始化数据库成功!"]);
                    tip = false;
                }
            });
            // 初始化Blog的测试数据
            // Data.initBlogTestData();
            // db.blog.count().then(function (count) {
            //     if (count === 0) {
            //         db.blog.bulkAdd(Data.blogs);
            //         db.blogContent.bulkAdd(Data.blogContent);
            //         db.blogTags.add(Data.blogTags);
            //         if(tip){
            //              EventHub.$emit('goTip', ["初始化数据库成功!"]);
            //         }
            //     }
            // });
        }).then(() => {
            EventHub.$emit('initIndexDBCompleted', true);
        }).catch(function (err) {
            console.log(err);
            EventHub.$emit('goTip', ["初始化数据库失败!", false]);
            EventHub.$emit('initIndexDBCompleted', false);
        });
    }
});

export default db;


