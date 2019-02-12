import Vue from 'vue'
import FrontConfig from "../config/FrontConfig";
import Data from "./Data";

var EventHub = new Vue({
        data: {
            /*padCards*/
            folders: Data.pads,
            folderRoot: {
                id: "folderRoot",
                folders: Data.pads,
            },
            padCards: null,
            padsTop: FrontConfig.showTopOperationBar ? 120 : 60,

            /*pad*/
            defaultFolder: null,
            defaultFolderId: "DUIS",
            colors: FrontConfig.colors,
            classify: [
                {
                    id: 1,
                    name: '选择语言:'
                }, {
                    id: 2,
                    name:
                        'HTML'
                }, {
                    id: 3,
                    name: 'JavaScript'
                }, {
                    id: 4,
                    name: 'JAVA'
                }, {
                    id: 5,
                    name: 'SQL'
                }, {
                    id: 6,
                    name: 'C'
                }, {
                    id: 7,
                    name: 'C++'
                }, {
                    id: 8,
                    name: 'XML'
                }, {
                    id: 9,
                    name: 'JSON'
                }, {
                    id: 10,
                    name: 'CSS'
                }, {
                    id: 11,
                    name: 'KOTLIN'
                }, {
                    id: 12,
                    name: 'SCALA'
                }
            ],
            codeMirrors: new Map(),

            /*blogs*/
            blogs: [],
            blogTags: [],
            blogTagMap: new Map(),
            pageInfo: {
                total: 0, //Data.blogs.length,
                current: 1,
                pagenum: 10,     //一页十条
                pagegroup: 5,
                lastCurrent: 1,
            },
            blogSearch: {
                iskeywordSearch: false,
                keyword: null,
                isTagsSearch: false,
                tag: null,
            }
        },
        created() {
        },
        methods: {
            getPadParent(child) {
                if (!child.parentId)
                    return {children: this.folders};
                for (var i = 0; i < this.folders.length; i++) {
                    var queue = [this.folders[i]];
                    var item;
                    while (queue.length) {
                        item = queue.shift();
                        if (item.id === child.parentId) {
                            return item;
                        }
                        if (item.children && item.children.length) {
                            item.children.forEach(function (son) {
                                queue.push(son);
                            });
                        }
                    }
                }
            },
            /*获取当前子节点平级的所有元素*/
            getOrders(miniSelected, orders, parent) {
                orders.push({id: -1, name: "交换位置:"});
                var children = parent.children;
                for (var j = 0; j < children.length; j++) {
                    if (children[j].isShow)
                        orders.push({
                            id: children[j].id,
                            name: j + ' - ' + children[j].name,
                            isMiniSelected: miniSelected.name === children[j].name
                        });
                }
            },
            getTypes(miniSelected) {
                var myType = null;
                if (miniSelected.type && typeof miniSelected.type == "string") {
                    myType = miniSelected.type.toLocaleUpperCase();
                }
                for (var i = 0; i < EventHub.classify.length; i++) {
                    EventHub.classify[i].isMiniSelected = false;
                    if (EventHub.classify[i].name.toLocaleUpperCase() === myType) {
                        EventHub.classify[i].isMiniSelected = true;
                    }
                }
            },
            interchange(swapper, exchangeeId) {
                var parent = EventHub.getPadParent(swapper);
                var you, me, exchangee;
                var children = parent.children ? parent.children : parent;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (child.id === exchangeeId) {
                        you = i;
                        exchangee = child;
                    }
                    if (child.id === swapper.id) {
                        me = i;
                    }
                }
                children.splice(me, 1, exchangee);
                children.splice(you, 1, swapper);
            },
            insertPad(pad, parent, pos) {
                if (!pos) {
                    parent.children.push(pad);
                } else {
                    var isFinished = false;
                    for (var i = 0; i < parent.children.length; i++) {
                        if (parent.children[i].id === pos) {
                            parent.children.splice(i, 0, pad);
                            isFinished = true;
                            break;
                        }
                    }
                    if (!isFinished) {
                        parent.children.push(pad);
                    }
                }
            },
            getDefaultFolder() {
                for (var i = 0; i < this.folders.length; i++) {
                    if (this.folders[i].id === this.defaultFolderId) {
                        return this.folders[i];
                    }
                }
                var defaultFolder = {
                    parentId: null,
                    id: this.defaultFolderId,
                    name: "DEFAULT",
                    isShow: true,
                    isChecked: false,
                    isStretch: true,
                    children: [],
                };
                this.folders.push(defaultFolder);
                return defaultFolder;
            },
            getMyType(type) {
                if (!type)
                    return null;
                var mode = null;
                switch (type.toLocaleUpperCase()) {
                    case  "CSS":
                        mode = "text/css";
                        break;
                    case  "XML":
                        mode = "text/xml";
                        break;
                    case  "HTML":
                        mode = "text/html";
                        break;
                    case  "JSON":
                        mode = "application/json";
                        break;
                    case  "JAVASCRIPT":
                        mode = "application/javascript";
                        break;
                    case  "JAVA":
                        mode = "text/x-java";
                        break;
                    case  "KOTLIN":
                        mode = "text/x-kotlin";
                        break;
                    case  "SCALA":
                        mode = "text/x-scala";
                        break;
                    case  "C":
                        mode = "text/x-c";
                        break;
                    case  "C++":
                        mode = "text/x-c++src";
                    case  "SQL":
                        mode = "text/x-sql";
                        break;
                }
                return mode;
            },
            putBlogTag(tag, isAdd = true) {
                tag = tag.trim();
                if (tag) {
                    var count = this.blogTagMap.get(tag) || 0;
                    count = isAdd ? count + 1 : count - 1;
                    if (!isAdd && count === 0)
                        this.blogTagMap.delete(tag);
                    else
                        this.blogTagMap.set(tag, count);
                }
            },
            makeBlogTags() {
                this.blogTags.splice(0, this.blogTags.length);
                this.blogTags.push(...this.blogTagMap.keys());
            },
            changePageInfo(pages, turnLast = false) {
                this.pageInfo.total = pages.length;
                this.pageInfo.current = 1;
                if (turnLast)
                    this.pageInfo.current = this.pageInfo.lastCurrent;
            },
            changeBlogKeyWord(who, param) {
                switch (who) {
                    case "keyword":
                        this.blogSearch.iskeywordSearch = true;
                        this.blogSearch.keyword = param;
                        this.blogSearch.isTagsSearch = false;
                        break;
                    case "tag":
                        this.blogSearch.isTagsSearch = true;
                        this.blogSearch.tag = param;
                        this.blogSearch.iskeywordSearch = false;
                        break;
                    default:
                        this.blogSearch.iskeywordSearch = false;
                        this.blogSearch.isTagsSearch = false;
                        this.blogSearch.keyword = null;
                        this.blogSearch.tag = null;
                }
            }
        },

    })
;

export default EventHub;